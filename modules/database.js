// require sequelize
const Sequelize = require('sequelize')

// connect to database spotifyjukebox
let db = new Sequelize('spotifyjukebox', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: 'localhost',
	dialect: 'postgres'
})

// create model for users
let User = db.define('user', {
	// say name has to be unique in this table for login purposes
	spotify_id: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false
	},
	access_token: {
		type: Sequelize.STRING,
		allowNull: false
	},
	refresh_token: {
		type: Sequelize.STRING,
		allowNull: false
	}
})

// for when I'm not deleting users yet, can be set to sync when log out and expired session delete user
// db.sync({force:true})

db.sync()

// by requiring database.js the code runs one time, by sending User in an object you can access and create a user in routes
// for example: db.User.create
module.exports = {User:User}