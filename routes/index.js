const express = require('express');
// to make http calls:
const request = require('request');
// create a router
const router = express.Router();

const spotifyAccessToken = require(__dirname + '/../modules/spotify-access-token');

// require database.js module
const db = require(__dirname + '/../modules/database');

router.route('/')
	.get((req, res) => {

		let user = req.session.user;

		if(user){
			db.User.findOne({
				where: {
					spotify_id: user
				}
			})
			.then((user) => {
				// give req.session.user (spotify_id) to getValidToken function, to check if access token is still valid
				// because if it's not we can't get the playlists for this user, without refreshing it
				spotifyAccessToken.getValidToken(req.session.user)
					// when we have a valid token, use the accesToken we got back from the promise in the resolve
					// to access the user's playlists
					.then((accessToken) => {
						let user_id = user.spotify_id;

						// set the options to make a call to get back the playlists in body
						let options = {
							url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
							headers: { 'Authorization': `Bearer ${accessToken}` },
							json: true
						};

						// use the access token to access the Spotify Web API and get back the playlists
						request.get(options, (error, response, body) => {

							// filter: only return playlists which current user owns
							let user_playlists = body.items.filter((item) => {
								return item.owner.id == user_id;
							});

							// make an array with objects to populate the playlist_dropdown
							let playlist_dropdown = user_playlists.map((playlist) => {
								return {
									name: playlist.name,
									id: playlist.id
								};
							});
							// render index and send the user's data for the profile + the playlist_dropdown array
							res.render('index', {user: user, playlist_dropdown: playlist_dropdown});
						});
				});
			});
		} else {
			res.render('login', {message: req.query.message});
		}
	});

// redirect to root if someone goes to /index
router.route('/index')
	.get((req, res) => {
		res.redirect('/');
	})

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;