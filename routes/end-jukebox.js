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
					// update user add jukebox_playlistid sent from jukebox.pug
					jukebox_playlistid: null
				}, {
					where: {
						spotify_id: user
					}
				}
				);
				res.redirect('/');
			} else {
				res.redirect('/');
			}
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;