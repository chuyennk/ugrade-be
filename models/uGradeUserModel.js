const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    UserName:  {type: String, required: true},
    UserPass: {type: String, required: true},
    UserRole: {type: String, required: true},
    UserTeam: {type: String, required: true},
    CreatedDate: {type: Date, default: Date.now},
    ModifiedDate: {type: Date, default: Date.now},
})

const UserModel = mongoose.model('UserModel', UserSchema, 'users')

const UserRoleSchema = mongoose.Schema({
    RoleCode: {type: Number, required: true},
    RoleDescription: {type: String, required: true},
    CreatedDate: {type: Date, default: Date.now},
    ModifiedDate: {type: Date, default: Date.now},
})
const UserRoleModel = mongoose.model('UserRoleModel', UserRoleSchema, 'userRoles')

const UserTeamSchema = mongoose.Schema({
    TeamCode: {type: Number, required: true},
    TeamDescription: {type: String, required: true},
    CreatedDate: {type: Date, default: Date.now},
    ModifiedDate: {type: Date, default: Date.now},
})

const UserTeamModel = mongoose.model('UserTeamModel', UserTeamSchema, 'userTeams')

module.exports = {
    UserModel: UserModel,
    UserRoleModel: UserRoleModel,
    UserTeamModel: UserTeamModel
  }