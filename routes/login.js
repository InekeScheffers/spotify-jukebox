/** For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const express = require('express')
const request = require('request') // "Request" library
const querystring = require('querystring')

// create a router
const router = express.Router()

const client_id = '***REMOVED***'; // Your client id
const client_secret = '***REMOVED***'; // Your secret
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

	  var state = generateRandomString(16);
	  res.cookie(stateKey, state);

	  // your application requests authorization
	  var scope = 'user-read-private user-read-email';
	  res.redirect('https://accounts.spotify.com/authorize?' +
	    querystring.stringify({
	      response_type: 'code',
	      client_id: client_id,
	      scope: scope,
	      redirect_uri: redirect_uri,
	      state: state
	    }));
	});

router.route('/callback')
	.get(function(req, res) {

	  // your application requests refresh and access tokens
	  // after checking the state parameter

	  var code = req.query.code || null;
	  var state = req.query.state || null;
	  var storedState = req.cookies ? req.cookies[stateKey] : null;

	  if (state === null || state !== storedState) {
	    res.redirect('/#' +
	      querystring.stringify({
	        error: 'state_mismatch'
	      }));
	  } else {
	    res.clearCookie(stateKey);
	    var authOptions = {
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
	            refresh_token = body.refresh_token;

	        var options = {
	          url: 'https://api.spotify.com/v1/me',
	          headers: { 'Authorization': 'Bearer ' + access_token },
	          json: true
	        };

	        // use the access token to access the Spotify Web API
	        request.get(options, function(error, response, body) {
	          console.log(body);
	        });

	        // we can also pass the token to the browser to make requests from there
	        res.redirect('/#' +
	          querystring.stringify({
	            access_token: access_token,
	            refresh_token: refresh_token
	          }));
	      } else {
	        res.redirect('/#' +
	          querystring.stringify({
	            error: 'invalid_token'
	          }));
	      }
	    });
	  }
	});

router.route('/refresh_token')
	.get(function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
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
