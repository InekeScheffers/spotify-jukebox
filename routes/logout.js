const express = require('express')
// create a router
const router = express.Router()

// require database.js module
let db = require(__dirname + '/../modules/database')

router.route('/logout')
	.get((req, res) => {
			let user = req.session.user;
			if(user){
				db.User.destroy({
  					where: {
   						spotify_id: req.session.user
  					}
				})
				.then( () => {
					req.session.destroy( (err) => {
						if(err) {
							throw err;
						}
						// redirect to log in page and show message
						res.redirect('/?message=' + encodeURIComponent("Successfully ended jukebox!"));
					})
				})
			} else {
				res.redirect('/')
			}
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router