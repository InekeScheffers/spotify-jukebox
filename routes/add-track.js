const express = require('express');
// to make http calls:
const request = require('request');

const spotifyAccessToken = require(__dirname + '/../modules/spotify-access-token');

// create a router
const router = express.Router();

// require database.js module
const db = require(__dirname + '/../modules/database');

//:user_id is req.params in express
router.route('/add-track/:user_id')
	.get((req, res) => {
		//console.log(req.params);
		db.User.findOne({
			where: {
				spotify_id: req.params.user_id
			}
		})
		.then((user) => {
			if(user){
				// render remote.pug when there's a user with this id in the database
				res.render('remote', {user_name: user.display_name});
			} else {
				res.redirect('/?message=' + encodeURIComponent("Oops, this jukebox is no more. Please log in to start your own."));
			}
		})
	})
	.post((req, res) => {
		// store track_id sent from public/add-track.js
		const track_id = req.body.track_id;
		
		// find user to have access to access_tocken, spotify_id and jukebox_playlistid
		db.User.findOne({
			where: {
				// remote is not in the session, get's user id from express params in url
				spotify_id: req.params.user_id
			}
		})
		.then( (user) => {
			// if the user exists AND the playlist still exists
			if(user && user.jukebox_playlistid) {
				// give user.spotify_id (spotify_id) to getValidToken function, to check if access token is still valid
				// because if it's not we can't get the playlists for this user, without refreshing it				
				spotifyAccessToken.getValidToken(user.spotify_id)
					// when it's checked and we got back the valid token (old or new)
					// add track to playlist with this token
					.then((accessToken) => {
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
								res.send({message: 'Your track will appear in the jukebox shortly'});
							} else {
								res.send({message: 'Oops try again', error: error, responsestatusCode: response.statusCode});
							}
						});
					});
			} else {
				res.send({redirect: '/?message=' + encodeURIComponent("Oops, this jukebox is no more. Please log in to start your own.")});
			}
		});
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;