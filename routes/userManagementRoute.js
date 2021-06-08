const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { UserModel } = require('../models/uGradeUserModel')

router.post('/login', async (req, res) => {
	try {
		const user = await UserModel.findOne({ UserName: req.body.usr })
		if (user && req.body.pwd == user.UserPass) {
			let token = jwt.sign(
				{
					UserName: user.UserName,
					UserPass: user.UserPass,
					UserRole: user.UserRole,
					UserTeam: user.UserTeam,
				},
				process.env.SECRETE_KEY
			)
			res.status(200).json({ message: 'OK', params: { loginToken: token, loginUser: user } })
		} else {
			res.status(403).json({ error: 'wrong username or password!', params: 'error' })
		}
	} catch (err) {
		// console.log(err)
		res.status(401).json({ message: err.message, params: 'error' })
	}
})

router.post('/adduser', async (req, res) => {
	const { UserName, UserPass, UserRole, UserTeam } = req.body

	const newuser = new UserModel({ UserName: UserName, UserPass: UserPass, UserRole: UserRole, UserTeam: UserTeam })
	try {
		const savedUser = await newuser.save()
		res.status(200).json({ message: 'OK', params: savedUser })
	} catch (err) {
		res.status(401).json({ message: err.message, params: 'error' })
	}
})

router.get('/getuser/:id', async (req, res) => {
	try {
		const user = await UserModel.find({ UserName: req.params.id })
		res.status(200).json({ message: 'OK', params: user })
	} catch (err) {
		res.status(401).json({ message: err.message, params: req.params.id })
	}
})

module.exports = router
