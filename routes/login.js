/** For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const express = require('express')
const request = require('request') // "Request" library
const querystring = require('querystring')

// require and configure dotenv
const dotenv = require('dotenv').config()

// require database.js module
let db = require(__dirname + '/../modules/database')

// create a router
const router = express.Router()

// stored client id and secret key in environment var
const client_id = process.env.DB_CLIENT_ID; // Your client id
const client_secret = process.env.DB_CLIENT_SECRET; // Your secret key
const redirect_uri = 'http://localhost:8000/callback'; // Your redirect uri

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

router.route('/login')
	.get(function(req, res) {
		// if al ingelogd(session) direct naar /
		let user = req.session.user
		if(user){
			 res.redirect('/')
		} else {
		// else dit:

		  var state = generateRandomString(16);
		  res.cookie(stateKey, state);

		  // your application requests authorization
		  var scope = 'user-read-private user-read-email';
		  // the service’s /authorize endpoint, passing to it the client ID, scopes, and redirect URI
		  res.redirect('https://accounts.spotify.com/authorize?' +
		    querystring.stringify({
		      response_type: 'code',
		      client_id: client_id,
		      scope: scope,
		      redirect_uri: redirect_uri,
		      state: state,
		      // force to approve app again, can be turned off after building
		      //show_dialog: true
		    }));
		}
	});

router.route('/callback')
	.get(function(req, res) {

	  // your application requests refresh and access tokens
	  // after checking the state parameter
	  var code = req.query.code || null;
	  var state = req.query.state || null;
	  var storedState = req.cookies ? req.cookies[stateKey] : null;

	  if (state === null || state !== storedState) {
	    res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."));
	  } else {
	    res.clearCookie(stateKey);
	    var authOptions = {
	    //Service’s /api/token endpoint, passing to it the authorization code returned by the first call and the client secret key. This second call returns an access token and also a refresh token.
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

	    request.post(authOptions, function(error, response, body) {
	      if (!error && response.statusCode === 200) {
	        var access_token = body.access_token,
	            refresh_token = body.refresh_token,
	            access_expires = Date.now() + (body.expires_in * 1000)

	        var options = {
	          url: 'https://api.spotify.com/v1/me',
	          headers: { 'Authorization': 'Bearer ' + access_token },
	          json: true
	        };

	        // use the access token to access the Spotify Web API
	        request.get(options, function(error, response, body) {

	        	// update or create/insert
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
	        	}).then(() => {
	        		//because upsert can only return a boolean, find the logged in user
	        		db.User.findOne({
	        			where: {
	        				spotify_id: body.id
	        			}
	        		})
	        		.then((user) => {
	        			if(!user){
	        				res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."))
	        			} else {
		        			// start session and store user's spotify id
			        		req.session.user = user.spotify_id;
			        		// render index
					        res.redirect('/')
			        	}
		        	})
	        	})
	         });
	      } else {
	      	// invalid token
	        res.redirect('/?message=' + encodeURIComponent("Oops, something went wrong. Try again."));
	      }
	    });
	  }
	});

// get this route automatically when access token is expired, check before each api call using access token
// catch when route is requested without sending the refresh token -> redirect to /
router.route('/refresh_token')
	.get(function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
  	// a refresh token is sent to /api/token. This will generate a new access token that we can issue when the previous has expired.
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

// module.exports says: the current file when required will send back this thing
// router refers to variable router = object with all router-routes in it
module.exports = router
