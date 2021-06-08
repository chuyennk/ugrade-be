const mongoose = require('mongoose')
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching')

const CustSchema = mongoose.Schema({
	custID: { type: String, required: true },
	custName: { type: String, required: true },
	bizRegNum: { type: String, required: true },
	bizRegDate: { type: Date, required: true },
	industryCode: { type: String, required: true, default: '0000' },
	rmCode: { type: String, required: true },
	teamCode: { type: String, required: true },
	createdDate: { type: Date, default: Date.now },
	modifiedDate: { type: Date, default: Date.now },
})

CustSchema.plugin(mongoose_fuzzy_searching, {
	fields: ['custID', 'custName', 'rmCode', 'teamCode'],
})
const CustModel = mongoose.model('CustModel', CustSchema, 'customers')

module.exports = {
	CustModel,
}
