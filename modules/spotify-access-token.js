const Sequelize = require('sequelize')
const request = require('request');
const dotenv = require('dotenv').config();

let db = require(__dirname + '/../modules/database');

const client_id = process.env.DB_CLIENT_ID; // App's client id
const client_secret = process.env.DB_CLIENT_SECRET; // App's secret key

const getSpotifyAccessToken = (spotify_id) => {
	return new Promise((resolve, reject) => {

		db.User.findOne({
			where: {
				spotify_id: spotify_id
			}
		})
		.then((user) => {

			if(user) {
				console.log(user);
			}	
			const accessToken = user.access_token;
			const accessTokenExpires = user.access_expires;
			const dateNow = Date.now();

			if(Date.now() > accessTokenExpires) {


				var authOptions = {
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

				request.post(authOptions, (error, response, body) => {
					if (!error && response.statusCode === 200) {
						const new_access_token = body.access_token;
						const access_expires = Date.now() + ((body.expires_in - 300) * 1000);
						
						db.User.update({
							access_token: new_access_token,
							access_expires: access_expires
						}, {
							where: {
								spotify_id: user.spotify_id
							}
						}).then(() => {
							console.log('reslove new access_token', new_access_token);
							resolve(new_access_token);
						});
					}
				});
			} else {
				console.log('reslove old access_token', accessToken);
				resolve(accessToken);
			}

			
		});
	});
};



module.exports = {getValidToken: getSpotifyAccessToken};