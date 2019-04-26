const webpack = require('webpack');
const path = require( 'path' );
const p = $$$.paths;
const entry = p.client + '/entry.js';

var session = {
	count: 0
};

module.exports = {
	isSlowRefresh: false,

	autoOpen: {
		enabled: false,
		count: 3,
	},
	
    web: {
        port: 9999,
        routes: {
			//'/api/*'(req, res, next) {next()},
			'/count'( req, res, next ) {
				res.send( { count: session.count++ } );
			},

			'/js/extensions.js': p._bpa.server + '/extensions.js',

			'/test': {
				'/abc': "This is abc",
				'/*': "This is a testtttt",
			},
			
			'/*': ['*MEMORY*', p.public, p._bpa.public],
		},
    },

	sass: {
		delayUpdate: 500,
		output: p.public + '/css/styles.css',
		compiler: {
			file: p._bpa.client + '/css/-main.scss',
			includePaths: [ p.client + '/css' ]
		},
	},

	socketIO: { serveClient: false },

	webpack() {
		return {
			entry: { 'bundle': entry },

			output: {
				path: path.resolve( p.dist ),
				filename: "[name].js"
			},

			module: {
				rules: [
					{
						test: /\.js$/, use: {
							loader: 'babel-loader',
							options: {
								babelrc: true,
								presets: ['@babel/preset-env']
							}
						}
					},
					{
						test: /\.vue$/, use: {
							loader: 'vue-loader',
							options: {
								loaders: {
									template: 'html-loader',
									js: 'babel-loader',
									scss: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
								}
							}
						}
					},
					{ test: /\.s[a|c]ss$/, use: ['sass-loader'] },
					{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
				]
			},

			resolve: {
				alias: {
					'~bpa': p._bpa.root,
					'~bpa-libs': p._bpa.server,
					'~bpa-js': p._bpa.client + '/js',
					'~bpa-vue': p._bpa.client + '/vue',
					'~extensions': p._bpa.server + '/extensions.js',
					'~libs': p.server,
				}
			},

			resolveLoader: {
				alias: {
					'scss-loader': 'sass-loader',
				},
			},

			optimization: {
				minimize: $$$.env.isProd,
			},

			plugins: [
				new webpack.DefinePlugin( { ENV: $$$.env } )
			]
		}
	}
};