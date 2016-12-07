// This section sets up an express server dependent on pug
const express = require('express')
// for spotify login
var cookieParser = require('cookie-parser')
const app = express()

// settings for pug
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'))
app.use(cookieParser())

console.log('Server is running...')

// require routes
const indexRouter = require(__dirname + '/routes/index')
const loginRouter = require(__dirname + '/routes/login')

// use routes
app.use('/', indexRouter)
app.use('/', loginRouter)

app.listen(8000)