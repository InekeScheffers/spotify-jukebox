/** For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const express = require('express');
// to make http calls:
const request = require('request');
const querystring = require('querystring');

// require and configure dotenv, to store keys savely in .env and access them as environment variables
const dotenv = require('dotenv').config();

// require database.js module
const db = require(__dirname + '/../modules/database');

// create a router
const router = express.Router();

// stored client id and secret key in environment var
const client_id = process.env.DB_CLIENT_ID; // App's client id
const client_secret = process.env.DB_CLIENT_SECRET; // App's secret key
const redirect_uri = 'http://localhost:8000/callback'; // App's redirect uri

let generateRandomString = (length) => {
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

let stateKey = 'spotify_auth_state';

router.route('/login')
	.get((req, res) => {
		let user = req.session.user;

		// if logged in(session) straight to /
		if(user){
			 res.redirect('/');
		} else {
			// state is random string of 16 characters
			let state = generateRandomString(16);
			res.cookie(stateKey, state);

			// app requests authorization
			let scope = 'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private';
			// the service’s /authorize endpoint, passing to it the client ID, scopes, and redirect URI
			res.redirect('https://accounts.spotify.com/authorize?' +
				querystring.stringify({
					response_type: 'code',
					client_id: client_id,
					scope: scope,
					redirect_uri: redirect_uri,
					state: state,
					// force to approve app again, or switch user
					show_dialog: true
				}));
		}
	});

// triggered by redirect of /loggin
router.route('/callback')
	.get((req, res) => {

		// app requests refresh and access tokens, after checking the state parameter
		let code = req.query.code || null;
		let state = req.query.state || null;
		let storedState = req.cookies ? req.cookies[stateKey] : null;

		if (state === null || state !== storedState) {
			res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."));
		} else {
			res.clearCookie(stateKey);
			let authOptions = {
			//Service’s /api/token endpoint, passing to it the authorization code returned by the first call and the client secret key. 
			//This second call returns an access token and also a refresh token.
				url: 'https://accounts.spotify.com/api/token',
				form: {
					code: code,
					redirect_uri: redirect_uri,
					grant_type: 'authorization_code'
				},
				headers: {
					'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
				},
				json: true
			};

			request.post(authOptions, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					let access_token = body.access_token,
						refresh_token = body.refresh_token,
						// expires_in = 3600 seconds
						// so access token expires at: the time now (ms) + expires_in (sec), so * 1000
						// to be safe extract 300 (sec) = 5 min
						access_expires = Date.now() + ((body.expires_in - 300) * 1000);

					let options = {
						// url to get user profile data
						url: 'https://api.spotify.com/v1/me',
						headers: { 'Authorization': 'Bearer ' + access_token },
						json: true
					};

					// use the access token to access the Spotify Web API, and get all the user profile data
					request.get(options, (error, response, body) => {

						// update when user already exists or create/insert when user doesn't exist
						// checks through spotify_id 'cause in database it's stated this one should be unique
						db.User.upsert({
							spotify_id: 	body.id, 
							access_token: 	access_token,
							refresh_token: 	refresh_token,
							access_expires: access_expires,
							display_name: 	body.display_name,
							profile_image: 	body.images[0].url,
							email: 			body.email,
							uri: 			body.uri,
							country: 		body.country
						})
						.then(() => {
							//because upsert can only return a boolean, find the logged in user
							db.User.findOne({
								where: {
									spotify_id: body.id
								}
							})
							.then((user) => {
								if(!user){
									res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."));
								} else {
									// start session and store user's spotify id in session
									req.session.user = user.spotify_id;
									// render index
									res.redirect('/');
								}
							});
						});
					 });
				} else {
					// invalid token
					res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."));
				}
			});
		}
	});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router;
