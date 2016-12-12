const express = require('express');
// to make http calls:
const request = require('request');

// create a router
const router = express.Router();

// require database.js module
const db = require(__dirname + '/../modules/database');
// require the module to check/update validity of access token
const spotifyAccessToken = require(__dirname + '/../modules/spotify-access-token');

router.route('/create-playlist')
	.post((req, res) => {
		// get input
		let newPlaylistName = req.body.playlist
		// check if access token is still valid
		if(newPlaylistName){
			spotifyAccessToken.getValidToken(req.session.user)
				.then((accessToken) => {
					// console.log("this is the access token: " + accessToken)
					// store options for post request to spotify api
					let options = {
						url: `https://api.spotify.com/v1/users/${req.session.user}/playlists`,
						headers: { 'Authorization': `Bearer ${accessToken}` },
						body: {
							"name": newPlaylistName
						},
						json: true
					};

					console.log(options)
					// post new playlist via spotify api call
					request.post(options, (error, response, body) => {
						// if success
						if (!error && response.statusCode === 201) {
							// send to public/add-track.js
							console.log('playlist added?')
							console.log(body.id)
						} else {
							console.log('fail')
							console.log(body)
						}
					});
				});
		} else {
			res.redirect('/')
		}
		// create playlist through api call
		// get playlist_id and then update:

		// db.User.update({
		// 	// update user add jukebox_playlistid sent from jukebox.pug
		// 	jukebox_playlistid: req.body.playlist_id
		// }, {
		// 	where: {
		// 		spotify_id: req.session.user
		// 	}
		// }
		// );
		// res.redirect('/jukebox');
	})
	.get((req, res) => {
		res.redirect('/');
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;