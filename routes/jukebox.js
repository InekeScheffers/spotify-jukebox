const express = require('express');
// require module to make qrcode of remote url
const qrcode = require('qrcode');
// require and configure dotenv, to store keys savely in .env and access them as environment variables
const dotenv = require('dotenv').config();

// create a router
const router = express.Router();

// require database.js module
const db = require(__dirname + '/../modules/database');

router.route('/jukebox')
	.get((req, res) => {
		let user = req.session.user;

		if(user){
			db.User.findOne({
					where: {
						spotify_id: user
					}
				}).then((user) => {
					// if there is a playlist chosen, otherwise redirect to '/' to choose one
					if(user.jukebox_playlistid) {
						return new Promise((resolve, reject) => {
							qrcode.toDataURL(`${process.env.BASE_URL}/add-track/${user.spotify_id}`, (err,url) => {
								resolve(url);
							})
						}).then((url) => {
							// render jukebox.pug and send url of selected playlist
							res.render('jukebox', {user_id: user.spotify_id, user_name: user.display_name, jukebox_url: `https://embed.spotify.com/?uri=spotify:user:${user.spotify_id}:playlist:${user.jukebox_playlistid}`, jukebox_qrcode: url});
						})
					} else {
						res.redirect('/');
					}
				})
		} else {
			res.redirect('/');
		}
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;