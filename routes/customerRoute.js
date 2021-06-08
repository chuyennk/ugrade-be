const express = require('express')
const router = express.Router()
const { CustModel } = require('../models/customerModel')

router.get('/fuzzysearch/:strsearch', async (req, res) => {
	try {
		const results = await CustModel.fuzzySearch({ query: req.params.strsearch, prefixOnly: true, minSize: 5, exact: false }).limit(20)
		// const results = await CustModel.fuzzySearch('mobi')
		res.json({ message: 'OK', params: results })
	} catch (err) {
		res.json({ message: err.message, params: req.params.strsearch })
	}
})

router.get('/getcust/:custid', async (req, res) => {
	try {
		// console.log(req.params.custid)
		let cust = await CustModel.findOne({ custID: req.params.custid })
		res.json({ message: 'OK', params: cust })
	} catch (err) {
		res.json({ message: err.message, params: req.params.custid })
	}
})

router.post('/savecusts', async (req, res) => {
	try {
		custs = req.body
		// const custModel = new CustModel(custs)
		const savedSc = await CustModel.insertMany(custs)
		res.json({ message: 'OK', params: savedSc })
	} catch (err) {
		res.json({ message: err.message, params: 'custs' })
	}
})

router.get('/updateFuzzySearch', async (req, res) => {
	try {
		const attrs = ['custID', 'custName', 'rmCode', 'teamCode']
		const docs = await CustModel.find()
		docs.forEach(async doc => {
			const obj = attrs.reduce((acc, attr) => ({ ...acc, [attr]: doc[attr] }), {})
			const updateDoc = await CustModel.findByIdAndUpdate(doc._id, obj)
		})

		res.json({ message: 'OK', params: 'Done' })
	} catch (err) {
		res.json({ message: err.message, params: 'Error' })
	}
})

module.exports = router
