// This section sets up an express server dependent on pug
const express = require('express')
const app = express()

// settings for pug
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'))

console.log('Server is running...')

// require routes
const indexRouter = require(__dirname + '/routes/index')

// use routes
app.use('/', indexRouter)

app.listen(8000)