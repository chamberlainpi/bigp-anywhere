const webpack = require('webpack');
const path = require('path');
const entry = $$$.paths.client + '/entry.js';
const bpaPaths = $$$.paths._bpa;

module.exports = {
	isSlowRefresh: false,

	autoOpen: {
		enabled: true,
		count: 3,
	},
	
    web: {
        port: 9999,
        routes: {
			//'/api/*'(req, res, next) {next()},

			'/js/extensions.js': bpaPaths.server + '/extensions.js',

			'/*': ['*MEMORY*', $$$.paths.public, bpaPaths.public],

			'/test': {
				'/': "test"
			}
		},
    },

	sass: {
		delayUpdate: 500,
		output: $$$.paths.public + '/css/styles.css',
		compiler: {
			file: bpaPaths.client + '/css/-main.scss',
			includePaths: [
				$$$.paths.client + '/css'
			]
		},
	},

	socketIO: { serveClient: false },

	webpack: {
		entry: { 'bundle': entry },

		output: {
			path: path.resolve($$$.paths.dist),
			filename: "[name].js"
		},

		module: {
			rules: [
				{ test: /\.js$/, use: {
					loader: 'babel-loader',
					options: {
						babelrc: true,
						presets: ['@babel/preset-env']
					}
				}},
				{ test: /\.vue$/, use: {
					loader: 'vue-loader',
					options: {
						loaders: {
							template: 'html-loader',
							js: 'babel-loader',
							scss: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
						}
					}
				}},
				{ test: /\.s[a|c]ss$/, use: ['sass-loader']},
				{ test: /\.css$/, use: [ 'style-loader', 'css-loader' ] },
			]
		},

		resolve: {
			alias: {
				'~bpa': bpaPaths.root,
				'~bpa-libs': bpaPaths.server,
				'~bpa-js': bpaPaths.client + '/js',
				'~bpa-vue': bpaPaths.client + '/vue',
				'~extensions': bpaPaths.server + '/extensions.js',
				'~libs': $$$.paths.server,
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
			new webpack.DefinePlugin({ENV: $$$.env})
		]
	}
};