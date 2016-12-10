const express = require('express');

// create a router
const router = express.Router();

// require database.js module
let db = require(__dirname + '/../modules/database');

router.route('/select-playlist')
	.post((req, res) => {
		db.User.update({
			// update user add jukebox_playlistid sent from jukebox.pug
			jukebox_playlistid: req.body.playlist_id
		}, {
			where: {
				spotify_id: req.session.user
			}
		}
		);
		res.redirect('/jukebox');
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;