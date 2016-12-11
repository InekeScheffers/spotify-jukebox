const express = require('express');

// create a router
const router = express.Router();

// require database.js module
let db = require(__dirname + '/../modules/database');

router.route('/jukebox')
	.get((req, res) => {
		let user = req.session.user;

		if(user){
			db.User.findOne({
					where: {
						spotify_id: user
					}
				}).then((user) => {
					// render jukebox.pug and send url of selected playlist
					res.render('jukebox', {user_id: user.spotify_id, jukebox_url: `https://embed.spotify.com/?uri=spotify:user:${user.spotify_id}:playlist:${user.jukebox_playlistid}`});
				})
		} else {
			res.redirect('/');
		}
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;