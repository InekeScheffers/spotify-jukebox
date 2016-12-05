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
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ],
    }
}

module.exports = config