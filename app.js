// This section sets up an express server dependent on pug
const express = require('express')
// for spotify login
var cookieParser = require('cookie-parser')
const session = require('express-session')
const app = express()

// settings for pug
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

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

// use routes
app.use('/', indexRouter)
app.use('/', loginRouter)
app.use('/', logoutRouter)

app.listen(8000)