const express = require('express');
// create a router
const router = express.Router();

// require database.js module
const db = require(__dirname + '/../modules/database');

router.route('/end-jukebox')
	.get((req, res) => {
			let user = req.session.user;

			if(user){
				db.User.update({
					// remove playlistid so remote can't endlessly keep adding tracks when you close your jukebox
					jukebox_playlistid: null
				}, {
					where: {
						spotify_id: user
					}
				});
				// redirects to your user profile where you can start a jukebox again
				res.redirect('/');
			} else {
				// redirects to root and lets you login
				res.redirect('/');
			}
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;