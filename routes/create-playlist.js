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
		// get name for new playlist from input from index.pug
		let newPlaylistName = req.body.playlist
		// if the field is not empty
		if(newPlaylistName){
			// check if access token is still valid
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

					// post new playlist via spotify api call
					request.post(options, (error, response, body) => {
						// if successfully created new playlist
						if (!error && response.statusCode === 201) {
							//console.log(body.id)

							// update jukebox_playlistid with the id of the playlist just created
							db.User.update({
								// update user add jukebox_playlistid sent from spotify api in body
								jukebox_playlistid: body.id
							}, {
								where: {
									spotify_id: req.session.user
								}
							}
							);
							// redirect to jukebox
							res.redirect('/jukebox');
						} else {
							res.redirect('/');
						}
					});
				});
		} else {
			res.redirect('/');
		}
	})
	.get((req, res) => {
		res.redirect('/');
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;