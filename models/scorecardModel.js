const mongoose = require('mongoose')

const ScCustInfo = mongoose.Schema({
	custID: { type: String, required: true },
	custName: { type: String, required: true },
	bizRegNum: { type: String, required: true },
	bizRegDate: { type: Date, required: true },
	industryInfo: {
		type: {
			code: String,
			desc: String,
		},
		required: true,
	},
})

const ScInfo = mongoose.Schema({
	scID: { type: String, required: true },
	scRunningNum: Number,
	scStatus: { type: String, required: true },
	scCreatedDate: { type: Date, default: Date.now },
	scCreatedBy: { type: String, required: true },
	scAprrovedDate: { type: Date },
	scApprovedBy: { type: String },
	scAprrovedDate_prev: { type: Date },
	fssDate: { type: Date },
	fssMthsCover: { type: Number },
	fssAuditType: { type: String },
	fssDate_prev: { type: Date },
	fssMthsCover_prev: { type: Number },
	fssAuditType_prev: { type: String },
	scConclusion: String,
})

const ScModelSchema = mongoose.Schema({
	scModelInfo: {
		scModelType: { type: String, required: true },
		scModelID: { type: String, required: true },
		scModelName: { type: String, required: true },
		scModelStatus: { type: String, required: true },
		scModelInheritable: [String],
		scModelCreatedDate: { type: Date, default: Date.now },
		scModelCreatedBy: String,
		scModelAprrovedDate: Date,
		scModeApprovedBy: String,
		ScModelActivatedDate: Date,
		ScModeActivatedBy: String,
	},
	scModelSpecialTreatments: [
		{
			seq: { type: Number, required: true },
			name: { type: String, required: true },
			outcome: { type: String, required: true }, //variable to keep the outcome in ScVariable
			showNA: { type: String, required: true }, //condition to show NA
			outcomeBox: {
				type: {
					rule: { type: String, required: false }, //rule to show outcome box next to special treatment name
				},
				required: false,
			},
			optionBox: {
				type: {
					options: {
						seq: { type: Number, required: true },
						value: { type: String, required: true },
						label: { type: String, required: true },
					},
				},
				required: false,
			},
			inputBox: {
				type: new mongoose.Schema({
					type: { type: String, required: true }, //type of the input, i.e. textbox, select box or custom component
					label: { type: String, required: true },
					output: { type: String, required: true }, //the final output that keep in ScVariables
					hideRule: { type: String, required: false }, //condition to hide the input, i.e. select an option
				}),
				required: false,
			},
			justification: {
				//a text area box to keep user justification for this special treatment
				type: {
					label: String,
					hideRule: String,
				},
				required: false,
			},
			adjustGrade: {
				type: [
					{
						rule: { type: String, required: true }, //Rule to apply this condition
						gradeAdj: { type: String, required: true }, //formula to change GradeAdj
					},
				],
				required: false,
			},
			initValue: {
				type: {
					seq: { type: Number, required: true },
					outcomeBox: { type: String, required: false },
					optionBox: { type: String, required: false },
					inputBox: { type: Object, required: false },
					justificationBox: { type: String, required: false },
				},
				required: true,
			},
		},
	],
	scModelFactorGroups: [
		{
			grpID: { type: String, required: true },
			grpName: { type: String, required: true },
			fssImportInd: { type: Boolean, default: false },
			initValue: {
				type: {
					grpID: String,
					grpScore: Number,
				},
				required: true,
			},
			factors: [
				{
					facID: { type: String, required: true },
					seq: { type: Number, default: 0 }, //To-do: see how to set running seq
					facName: { type: String, required: true },
					facDesc: { type: String },
					weight: { type: Number, default: 0 },
					attrCnt: { type: Number, default: 0 },
					attrSelectable: { type: Boolean, default: true },
					finConfig: {
						type: {
							fssImportCat: { type: String, default: '' },
							facValue_prefix: { type: String, default: '' },
							facValue_suffix: { type: String, default: '' },
						},
						required: false,
					},
					inputBox: {
						type: {
							boxtype: { type: String, required: true },
							params: [{ type: String }],
						},
						required: false,
					},
					initValue: {
						type: {
							facID: String,
							facLevel: Number,
							facScore: Number,
							facLevel_prev: Number,
							finValues: {
								type: {
									facValue: Number,
									facValue_prev: Number,
									facValue_import: Number,
									facValue_IsOvrd: Boolean,
									ovrdJustification: String,
								},
								required: false,
							},
							inputBox: { type: Object, reqired: false },
						},
						required: true,
					},
					attrs: [
						{
							id: { type: String, required: true },
							label: { type: String, required: true },
							value: { type: Number, default: 0 },
							condition: { type: String },
							score: { type: Number, default: 0 },
						},
					],
				},
			],
		},
	],
	scScore2Grade: [
		{
			lbound: Number,
			ubound: Number,
			grade: Number,
			PD: Number,
			lboundSign: String,
			uboundSign: String,
		},
	],
	scCommonValues: {
		type: {
			custInfo: ScCustInfo,
			scInfo: ScInfo,
			scVariables: {
				// These variables are fixed, populated from calculation engine, others will depend on the config
				aggScore: { type: Number, default: 0 },
				grade: { type: Number, default: 0 },
				gradeAdj: { type: Number, default: 0 },
				BOG: { type: Number, default: 0 },
				SOG: { type: Number, default: 0 },
				FOG: { type: Number, default: 0 },
			},
		},
		required: true,
	},
})

const ScTemplateModel = mongoose.model('ScModelSchema', ScModelSchema, 'scorecard_template')

const ScorecardSchema = mongoose.Schema({
	custInfo: ScCustInfo,
	scInfo: ScInfo,
	scModel: { type: mongoose.Schema.Types.ObjectId, ref: 'ScModelSchema' },
	scVariables: { type: Object },
	scVariables_prev: { type: Object },
	scSpecialTreatments: [{ type: Object, required: false }],
	scFactorGroups: [{ type: Object, required: false }],
	fssImported: { type: Object },
})

const ScorecardModel = mongoose.model('ScorecardModel', ScorecardSchema, 'scorecards')

module.exports = {
	ScorecardModel,
	ScTemplateModel,
}
