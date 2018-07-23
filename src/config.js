const webpack = require('webpack');
const path = require('path');
const entry = $$$.paths.client + '/entry.js';

module.exports = {
	isSlowRefresh: false,
	autoOpen: false,
    web: {
        port: 9999,
        routes: {
			'/js/extensions.js': $$$.paths._bpa.server + '/extensions.js',

			'^': [
				'*MEMORY*',
				$$$.paths.public,
				$$$.paths._bpa.public,
			],

			'/test': {
				'/': "test"
			},
		},
    },

	sass: {
		delayUpdate: 500,
		output: $$$.paths.public + '/css/styles.css',
		compiler: {
			file: $$$.paths._bpa.client + '/css/-main.scss',
			includePaths: [
				$$$.paths.client + '/css'
			]
		},
	},

	io: { serveClient: false },

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
				'~bpa': $$$.paths._bpa.root,
				'~bpa-libs': $$$.paths._bpa.server,
				'~bpa-js': $$$.paths._bpa.client + '/js',
				'~bpa-vue': $$$.paths._bpa.client + '/vue',
				'~extensions': $$$.paths._bpa.server + '/extensions.js',
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