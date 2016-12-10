// get autoprefixer module for the postcss
const autoprefixer = require ( 'autoprefixer' );
const config = {
	// get the main js file
	entry: __dirname + '/public/js/main.js',
	// create the webpack.js file
	output: {
		path: __dirname + '/public/js/',
		filename: 'webpack.js'
	},
	// watchmode
	watch: true,
	// module loader, use all these modules when creating
	module: {
		// webpack can only read js, loaders teach webpack how to load files for bundling
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			},
			{
				// look for .scss files
				test: /\.scss$/,
				// compile to normal css styles and run the postcss.
				loaders: ["style", "css", "sass", "postcss"]
			}
		]
	},
	// transpile css to support last 2 versions of all browsers.
	postcss: [
		autoprefixer( { browsers: ['last 2 versions'] } );
	]

}

module.exports = config;