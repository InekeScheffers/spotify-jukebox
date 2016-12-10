const express = require('express');
const request = require('request');

// create a router
const router = express.Router()

// require database.js module
let db = require(__dirname + '/../modules/database')

router.route('/add-track')
	.post((req, res) => {
		const track_id = req.body.track_id;
		db.User.findOne({
			where: {
				spotify_id: req.session.user
			}
		})
		.then( (user) => {
			let options = {
				url: `https://api.spotify.com/v1/users/${user.spotify_id}/playlists/${user.jukebox_playlist}/tracks`,
				headers: { 'Authorization': 'Bearer ' + user.access_token },
				body: {
					"uris": [`spotify:track:${track_id}`]
				},
				json: true
			};

			console.log(options);

			request.post(options, (error, response, body) => {
				if (!error && response.statusCode === 201) {
					res.send('Track added');
				} else {
					res.send('Oops, try again.')
				}
			});
		})
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router