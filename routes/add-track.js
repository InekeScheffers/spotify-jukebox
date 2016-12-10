const express = require('express');
// to make http calls:
const request = require('request');

// create a router
const router = express.Router();

// require database.js module
let db = require(__dirname + '/../modules/database');

router.route('/add-track')
	.post((req, res) => {
		// store track_id sent from public/add-track.js
		const track_id = req.body.track_id;
		
		// find user to have access to access_tocken, spotify_id and jukebox_playlistid
		db.User.findOne({
			where: {
				spotify_id: req.session.user
			}
		})
		.then( (user) => {
			// store options for post request to spotify api
			let options = {
				url: `https://api.spotify.com/v1/users/${user.spotify_id}/playlists/${user.jukebox_playlistid}/tracks`,
				headers: { 'Authorization': 'Bearer ' + user.access_token },
				body: {
					"uris": [`spotify:track:${track_id}`]
				},
				json: true
			};

			// post track to playlist via spotify api call
			request.post(options, (error, response, body) => {
				// if success
				if (!error && response.statusCode === 201) {
					// send to public/add-track.js
					res.send('Track added');
				} else {
					res.send('Oops, try again.');
				}
			});
		});
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;