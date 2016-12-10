// This section sets up an express server dependent on pug
const express = require('express')
// for spotify login
const cookieParser = require('cookie-parser')
const session = require('express-session')
const bodyParser = require('body-parser')
const app = express()

// settings for pug
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

// sets bodyParser as middleware for all requests that send json or urlendcoded data. rawBody contains the data as buffer, to check for errors if the wrong encoding is being used.
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({ 
	extended: true,
	verify:function(req,res,buf){req.rawBody=buf}
})); 

app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

// settings for express-session
app.use(session({
	secret:'suuuuuuper secret',
	resave:true,
	saveUninitialized: false
}))

console.log('Server is running...')

// require routes
const indexRouter = require(__dirname + '/routes/index')
const loginRouter = require(__dirname + '/routes/login')
const logoutRouter = require(__dirname + '/routes/logout')
const selectPlaylistRouter = require(__dirname + '/routes/select-playlist')
const jukeboxRouter = require(__dirname + '/routes/jukebox')
const addTrackRouter = require(__dirname + '/routes/add-track')

// use routes
app.use('/', indexRouter)
app.use('/', loginRouter)
app.use('/', logoutRouter)
app.use('/', selectPlaylistRouter)
app.use('/', jukeboxRouter)
app.use('/', addTrackRouter)

app.listen(8000)