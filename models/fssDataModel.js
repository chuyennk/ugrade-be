const mongoose = require('mongoose')

const FssDataModelSchema = mongoose.Schema({
    FssInfo: {
        CustID:  {type: String, required: true},
        CustName: {type: String, required: true},
        FssLevelType: {type: String, required: true},
        FssTemplateName: {type: String, required: true}
    },
    FssHeaders: [{
        FssDate: {type: Date, required: true},
        FssMonthCover: {type: Number, required: true},
        FssHasData: {type: Number, required: true, default: 0},
        FssReconStatus: {type: Number, required: true, default: 0},
        FssCcy: {type: String, required: true},
        FssDenominator: {type: String, required: true},
        FssAuditType: {type: String, required: true, default: 'DRAF'},
        FssAuditorName: {type: String},
        FssAuditOpinion: {type: String},
        CreatedDate: {type: Date, default: Date.now},
        CreatedBy: {type: String,},
        UpdateDate: {type: Date, default: Date.now,},
        UpdatedBy: {type: String,},
    }],
    FssItems: [{
        FssType: {type: String, required: true},
        Seq: {type: Number, required: true},
        CatCode: {type: String, required: true},
        Item: {type: String},
        ItemType: {type: String},
        Formula: {type: String},
        Format: {type: String},
        DependentItems: {type: String},
        FssYears: [{
            FssDate: {type: Date},
            AmtYr: {type: String},
            NoteYr: {type: String},
        }],
        UpdateDate: {type: Date, default: Date.now}
    }]
})

const FssDataModel = mongoose.model('FssDataModel', FssDataModelSchema, 'fssData')

const FssTemplateModelSchema = mongoose.Schema({
    FssTemplateName: {type: String, required: true},
    FssTemplateItems: [{
        FssType: {type: String, required: true},
        Seq: {type: Number, required: true},
        CatCode: {type: String, required: true},
        Item: {type: String},
        ItemType: {type: String, required: true},
        Formula: {type: String},
        DependentItems: {type: String},
    }]
})

const FssTemplateModel = mongoose.model('FssTemplateModel', FssTemplateModelSchema, 'fssTemplate')

module.exports = {
    FssDataModel,
    FssTemplateModel
}