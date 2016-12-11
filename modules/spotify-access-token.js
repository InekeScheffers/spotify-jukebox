// to make http calls:
const request = require('request');
// to access safely stored environment vars
const dotenv = require('dotenv').config();
// require path to database
const db = require(__dirname + '/../modules/database');

const client_id = process.env.DB_CLIENT_ID; // App's client id
const client_secret = process.env.DB_CLIENT_SECRET; // App's secret key

// function to check if access token is expired, if it is updates before resolving promise
// otherwise resolves with current still valid access token
// gets spotify_id from parameter when this function is called
const getSpotifyAccessToken = (spotify_id) => {
	// first has to find user, before the then executes
	return new Promise((resolve, reject) => {

		db.User.findOne({
			where: {
				spotify_id: spotify_id
			}
		})
		.then((user) => {
			// store the found user's accestoken, when it expires, and the time now in ms
			const accessToken = user.access_token;
			const accessTokenExpires = user.access_expires;
			const dateNow = Date.now();

			// access token is expired (cause the time now is bigger then the time set in the database for expire)
			if(Date.now() > accessTokenExpires) {

				// store authentication options
				let authOptions = {
					// a refresh token is sent to /api/token. This will generate a new access token that we can issue when the previous has expired.
					url: 'https://accounts.spotify.com/api/token',
					headers: { 
						'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
					form: {
						grant_type: 'refresh_token',
						refresh_token: user.refresh_token
					},
					json: true
				};

				// post to api a call to authenticate user and to refresh the access token
				request.post(authOptions, (error, response, body) => {
					if (!error && response.statusCode === 200) {
						const new_access_token = body.access_token;
						const new_access_expires = Date.now() + ((body.expires_in - 300) * 1000);
						
						// update the access token and set the new expire time
						db.User.update({
							access_token: new_access_token,
							access_expires: new_access_expires
						}, {
							where: {
								spotify_id: user.spotify_id
							}
						}).then(() => {
							// check if right path is followed
							// console.log('resolve new access_token', new_access_token);

							// resolve this promise and give back new_access_token as access token where the function was called
							resolve(new_access_token);
						});
					}
				});
			} else {
				// check if right path is followed
				// console.log('resolve old access_token', accessToken);

				// resolve this promise and give back (the old still valid) accessToken as access token where the function was called
				resolve(accessToken);
			}

			
		});
	});
};

// export this function so you can call it everywhere you require this module
module.exports = {getValidToken: getSpotifyAccessToken};