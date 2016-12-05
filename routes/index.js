const express = require('express')
// create a router
const router = express.Router()

router.route('/')
	.get((req, res) => {
			res.render('index')
	})

// redirect to root if someone goes to /index
router.route('/index')
	.get((req, res) => {
		res.redirect('/')
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router