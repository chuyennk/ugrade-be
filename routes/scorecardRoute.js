const express = require('express')
const router = express.Router()
const { ScorecardModel, ScTemplateModel } = require('../models/scorecardModel')

//Save a new Scorecard
router.post('/savescorecard', async (req, res) => {
	const scData = req.body

	// assign back factors and special treatments' values from ScModel for saving
	scData.scModel.scModelFactorGroups.forEach((grp, grpidx) => {
		scData.scFactorGroups[grpidx] = grp.initValue
		grp.factors.forEach((fac, facidx) => {
			scData.scFactorGroups[grpidx].factors[facidx] = fac.initValue
		})
	})
	scData.scModel.scModelSpecialTreatments.forEach((trm, trmidx) => {
		scData.scSpecialTreatments[trmidx] = trm.initValue
	})

	try {
		let savedSc = await ScorecardModel.findOneAndReplace({ 'scInfo.scID': scData.scInfo.scID }, scData)
		if (!savedSc) {
			const newSc = new ScorecardModel(scData)
			savedSc = await newSc.save()
		}
		res.status(200).json({ message: 'OK', params: savedSc })
	} catch (err) {
		res.status(200).json({ message: err.message, params: 'error' })
	}
})

router.get('/getscorecardlist/:custID', async (req, res) => {
	try {
		const scList = await ScorecardModel.find({ 'custInfo.custID': req.params.custID }, 'scInfo scVariables scModel', { lean: true }).populate(
			'scModel'
		)

		const list = scList.map(sc => {
			let obj = sc.scInfo
			obj['FOG'] = sc.scVariables.FOG
			obj['scModelID'] = sc.scModel.scModelInfo.scModelID

			return obj
		})

		res.status(200).json({ message: 'OK', params: list })
	} catch (e) {
		res.status(500).json({
			message: e.message,
			params: [],
		})
		return
	}
})

// Get back ascorecard data for a specific customer
router.get('/getscorecard/:scID', async (req, res) => {
	try {
		const scData = await ScorecardModel.findOne({ 'scInfo.scID': req.params.scID }, {}, { lean: true }).populate('scModel')

		// put the scorecard data to scModel initValue for the ease of computation
		// these sModel initValue will be set back to scorecard data when saving
		scData.scModel.scModelFactorGroups.forEach((grp, grpidx) => {
			grp.initValue = scData.scFactorGroups[grpidx]
			grp.factors.forEach((fac, facidx) => {
				fac.initValue = scData.scFactorGroups[grpidx].factors[facidx]
			})
		})
		scData.scModel.scModelSpecialTreatments.forEach((trm, trmidx) => {
			trm.initValue = scData.scSpecialTreatments[trmidx]
		})

		res.status(200).json({ message: 'OK', params: scData })
	} catch (err) {
		res.status(200).json({ message: err.message, params: 'error' })
	}
})

// To save a new scorecard model template - to-be-done in the frontend
router.post('/savetemplate', async (req, res) => {
	const scData = req.body

	try {
		let savedTemplate = await ScTemplateModel.findOneAndReplace({ 'scModelInfo.scModelID': scData.scModelInfo.scModelID }, scData)
		if (!savedTemplate) {
			const templateModel = new ScTemplateModel(scData)
			savedTemplate = await templateModel.save()
		}
		res.status(200).json({ message: 'OK', params: savedTemplate })
	} catch (err) {
		res.status(500).json({ message: err.message, params: scData })
	}
})

router.get('/getActScModels', async (req, res) => {
	try {
		const scActModels = await ScTemplateModel.find(
			{ 'scModelInfo.scModelStatus': 'AC' },
			'scModelInfo.scModelType scModelInfo.scModelID scModelInfo.scModelName'
		)
		res.status(200).json({
			message: 'OK',
			params: scActModels,
		})
	} catch (err) {
		res.status(500).json({
			message: err.message,
			params: [],
		})
	}
})

const getTimestampLocalIso = () => {
	//get timestamp in local timezone
	const dt = new Date()
	const offset = dt.getTimezoneOffset() * 60 * 1000
	const tLocal = new Date(dt - offset)

	// remove milisecond & -, : , T chars
	return tLocal.toISOString().slice(0, 19).replace(/[-:T]/g, '')
}

router.post('/createNewScorecard', async (req, res) => {
	try {
		const newScInfo = req.body
		const strTimestamp = getTimestampLocalIso()
		const newScID = newScInfo.custInfo.custID + '-' + strTimestamp

		const prev_sc = await ScorecardModel.findOne({
			'custInfo.custID': newScInfo.custInfo.custID,
			'scInfo.scStatus': ['AP', 'RT', 'PE', 'PA'],
		}).sort({ 'scInfo.scCreatedDate': -1 })

		if (prev_sc && ['PE', 'PA'].includes(prev_sc.scInfo.scStatus)) {
			res.status(200).json({
				message: 'There is a pending scorecard. Please get it approved/cancelled before create a new scorecard.',
				params: '',
			})
			return
		}

		//

		const scTemplate = await ScTemplateModel.findById(newScInfo.scModel.value)

		const scData = {
			custInfo: scTemplate.scCommonValues.custInfo,
			scInfo: scTemplate.scCommonValues.scInfo,
			scModel: newScInfo.scModel.value,
			scVariables: scTemplate.scCommonValues.scVariables,
			scVariables_prev: {},
			scSpecialTreatments: [],
			scFactorGroups: [],
			fssImported: {},
		}

		// if the prev scorecard status is Approved or Retired then assign previous scorecard values to display on the new scorecard
		if (prev_sc && ['AP', 'RT'].includes(prev_sc.scInfo.scStatus)) {
			scData.scInfo.scAprrovedDate_prev = prev_sc.scInfo.scAprrovedDate
			scData.scInfo.fssDate_prev = prev_sc.scInfo.fssDate
			scData.scInfo.fssMthsCover_prev = prev_sc.scInfo.fssMthsCover
			scData.scInfo.fssAuditType_prev = prev_sc.scInfo.fssAuditType

			scData.scVariables_prev = prev_sc.scVariables
		}

		scTemplate.scModelFactorGroups.forEach((grp, grpidx) => {
			let grpObj = {
				...grp.initValue,
				factors: [],
			}
			grp.factors.forEach((fac, facidx) => {
				let facObj = { ...fac.initValue }

				// if the prev scorecard status is Approved or Retired then assign previous facLevel & financial facValue
				if (prev_sc && ['AP', 'RT'].includes(prev_sc.scInfo.scStatus)) {
					const fac_prev = prev_sc.scFactorGroups[grpidx].factors[facidx]
					facObj.facLevel_prev = fac_prev.facLevel
					if (facObj.finValue) facObj.finValue.facValue_prev = fac_prev.finValue.facValue
				}
				grpObj.factors.push(facObj)
			})
			scData.scFactorGroups.push(grpObj)
		})

		scTemplate.scModelSpecialTreatments.forEach(trm => {
			scData.scSpecialTreatments.push(trm.initValue)
		})

		// Set key values for the new scorecard.
		for (let key in scData.custInfo) {
			if (key == 'industryInfo') {
				scData.custInfo[key].code = newScInfo.custInfo.industryCode
				scData.custInfo[key].desc = 'TO-BE-DONE'
			} else {
				scData.custInfo[key] = newScInfo.custInfo[key]
			}
		}
		scData.scInfo.scID = newScID
		scData.scInfo.scCreatedDate = Date.now()
		scData.scInfo.scCreatedBy = newScInfo.createdBy ? newScInfo.createdBy : 'zzzz'

		const newSc = new ScorecardModel(scData)
		savedSc = await newSc.save()
		res.status(200).json({ message: 'OK', params: savedSc })
	} catch (err) {
		res.status(200).json({ message: err.message, params: 'none' })
	}
})

module.exports = router
