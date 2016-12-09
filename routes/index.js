const express = require('express')
// create a router
const router = express.Router()

// require database.js module
let db = require(__dirname + '/../modules/database')

router.route('/')
	.get((req, res) => {
			let user = req.session.user;
			if(user){
				db.User.findOne({
	        			where: {
	        				spotify_id: user
	        			}
	        		}).then((user) => {
	        			res.render('index', {user:user})
	        		})
			} else {
				res.render('login', {message: req.query.message})
			}
	})

// redirect to root if someone goes to /index
router.route('/index')
	.get((req, res) => {
		res.redirect('/')
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router