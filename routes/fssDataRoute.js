const express = require('express')
const router = express.Router()
const {FssDataModel} = require('../models/fssDataModel')


let emptyFss = {
    FssInfo:{},
    FssHeaders: [],
    FssItems: [],
    message: 'No FSS found!.'
}

const convertMDBtoVXE = (mDB) => {
    let vxe = {}
    vxe = mDB

    // if no Fss created, return an empty FssData
    if (!vxe.FssInfo) {
        return emptyFss
    }

    // map the amount & note fields for each financial year in AmtYr1,2,3,..
    const yrStart = vxe.FssHeaders.length>5? 0 : 1
    vxe.FssHeaders.forEach((yr,idx) => {
        yr['AmtField'] = 'AmtYr' + (idx + yrStart)
        yr['NoteField'] = 'NoteYr' + (idx + yrStart)
    })

    vxe.FssItems.forEach(item => {
        vxe.FssHeaders.forEach((yr, idx) => {
            item[yr.AmtField] = item.FssYears[idx].AmtYr
            item[yr.NoteField] = item.FssYears[idx].NoteYr
        })
        delete item.FssYears
    })

    return vxe
}

const convertVXEtoMDB = (vxe) => {
    const FssInfo = vxe.FssInfo

    // set headers to the fsstable headers but not the 2 Amt & Note fields
    const FssHeaders = []
    vxe.FssHeaders.forEach(yr =>{
        let obj = {}
        for (let key in yr) {
            if (!['AmtField', 'NoteField'].includes(key)) obj[key] = yr[key]
        }
        FssHeaders.push(obj)
    })

    //set the items to fsstable items but convert Amt & Note fields to FssYears array
    const FssItems = []
    vxe.FssItems.map(line => {
        let objLine = {}
        // first just copy all keys to objLine
        for (let key in line){
            objLine[key] = line[key]
        }
        // then add in FssYears array with value from the headers and respective Amt/Note fields
        objLine['FssYears'] = []
        vxe.FssHeaders.forEach(yr => {
            let fssYr = {}
            fssYr['FssDate'] = yr['FssDate']
            fssYr['AmtYr'] = objLine[yr['AmtField']] || ''
            fssYr['NoteYr'] = objLine[yr['NoteField']] || ''
            objLine['FssYears'].push(fssYr)

            // with the Amt & Note for this fss year had been pushed in the above FssYears array, 
            // now can remove from the objLine
            if (line[yr['AmtField']]) delete objLine[yr['AmtField']]
            if (line[yr['NoteField']]) delete objLine[yr['NoteField']]
        }) 
        FssItems.push(objLine)
    })

    return {
        FssInfo,
        FssHeaders,
        FssItems
    }
}

//Save a new Fss
router.post('/savefssdata', async (req,res) => {
    const fssData = convertVXEtoMDB(req.body)

    try{
        let savedFss = await FssDataModel.findOneAndReplace({'FssInfo.CustID': fssData.FssInfo.CustID, 'FssInfo.FssLevelType': fssData.FssInfo.FssLevelType}, fssData)
        if (!savedFss) {
            const newFss = new FssDataModel(fssData)
            savedFss = await newFss.save()
        }
        res.status(200).json(req.body)
    }catch(err){
        emptyFss.FssInfo = req.body.FssInfo
        emptyFss.message = err.message
        res.status(500).json(emptyFss)
    }
})

// Get back FSS data for a specific customer
router.get('/getfssdata/:custID/:fssLevelType', async (req,res) => {
    try{
        FssDataModel.findOne(
            {'FssInfo.CustID': req.params.custID, 'FssInfo.FssLevelType': req.params.fssLevelType},
            {}, {lean: true},
            (err, docs) => {
                if (err || !docs) {
                    res.status(200).json(emptyFss)
                    return
                }

                const fssdata = convertMDBtoVXE(docs)
                res.status(200).json(fssdata)
            }
        )
    }catch(err){
        emptyFss.FssInfo = req.body.FssInfo
        emptyFss.message = err.message
        res.status(500).json(emptyFss)
    }
})

module.exports = router