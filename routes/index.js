const express = require('express');
// to make http calls:
const request = require('request');
// create a router
const router = express.Router();

const test = require(__dirname + '/../modules/spotify-access-token');

// require database.js module
let db = require(__dirname + '/../modules/database');

router.route('/')
	.get((req, res) => {

		test.then((data) => {
			console.log(data);
		});

		let user = req.session.user;

		if(user){
			db.User.findOne({
				where: {
					spotify_id: user
				}
			})
			.then((user) => {

				let user_id = user.spotify_id;

				let options = {
					url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
					headers: { 'Authorization': `Bearer ${user.access_token}` },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, (error, response, body) => {

					let user_playlists = body.items.filter((item) => {
						return item.owner.id == user_id;
					});

					let playlist_dropdown = user_playlists.map((playlist) => {
						return {
							name: playlist.name,
							id: playlist.id
						};
					});

					res.render('index', {user: user, playlist_dropdown: playlist_dropdown});
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