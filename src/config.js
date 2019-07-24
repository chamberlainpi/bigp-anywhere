const patchResolve = require( './server/sv-patch-resolve' );
const webpack = require( 'webpack' );
const path = require( 'path' );
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' );

const p = $$$.paths;
const node_modules = [
	p._bpa.node_modules,
	p._bpa.root,
	p.node_modules,
	'./node_modules',
];

p._bpa.localLibs = $$$.systemEnv( '%BPA_LOCAL_LIBS%' );

patchResolve( { from: p.root, to: p._bpa.root } );

var session = { count: 0 };

const appName = () => $$$.config.appName || '01_default';
const appPath = ( index ) => p( p.apps, appName(), index || '' );
const bpaAppPath = ( index ) => p( p._bpa.apps, appName(), index || '' );
const bpaCommon = ( index ) => p( p._bpa.apps, '00_common', index || '' );

const config = module.exports = {
	isSlowRefresh: false,

	autoOpen: {
		enabled: false,
		count: 3,
	},

	watcher: {
		delayStart: 500,
		delayPost: 10,
	},
	
	web() {
		return {
			port: 9999,
			routes: {
				'/count'( req, res, next ) {
					res.send( { count: session.count++ } );
				},
				'/reset'( req, res, next ) {
					res.send( { count: session.count = 0 } );
				},

				'/js/extensions.js': p._bpa.server + '/extensions.js',
				'/local': p._bpa.localLibs,
				
				'/*': ['*MEMORY*', appPath(), p.public, bpaAppPath(), p._bpa.public],
			},
		}
	},

	sass() {
		return {
			delayEach: 300,
			output: p.public + '/dist/styles.css',
			compiler: {
				file: bpaCommon( 'css/-main.scss' ),
				//sourceComments: true,
				outputStyle: 'expanded',
				includePaths: [
					bpaCommon('css'),
					appPath('css'),
					bpaAppPath('css'),
				]
			},
		}
	},

	socketIO: { serveClient: false },

	webpack() {
		const entries = [appPath(), bpaAppPath(), bpaCommon()]
			.map( a => a + '/entry.js' )
			.filter( dir => {
				return $$$.fs.existsSync( dir );
			} );
		
		if ( entries.length == 0 ) throw 'No entry.js file found in either BPA -or- current project folder:\n' + appPath();
		
		const entry = entries[0];

		return {
			mode: 'development',

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
								"presets": [
									"@babel/preset-env"
								],
								"plugins": [
									[
										"wildcard",
										{
											"noCamelCase": true,
											"exts": ["js", "vue"]
										}
									]
								]
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
								}
							}
						}
					},
					{ test: /\.scss$/, use: ['vue-style-loader','css-loader','sass-loader'] },
					{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
				]
			},

			resolve: {
				modules: node_modules,
				alias: {
					'~bpa': p._bpa.root,
					'~bpa-libs': p._bpa.server,
					'~bpa-app': bpaAppPath(),
					'~bpa-common': bpaCommon(),
					'~bpa-vue': bpaCommon( 'vue' ),
					'~bpa-js': bpaCommon( 'js' ),
					'~bpa-css': bpaCommon( 'css' ),
					'~app': appPath(),
					'~vue': appPath( 'vue' ),
					'~js': appPath( 'js' ),
					'~css': appPath( 'css' ),
					'~extensions': p._bpa.server + '/extensions.js',
					'~constants': p._bpa.server + '/constants.js',
					'~libs': p.server,
				}
			},

			resolveLoader: {
				modules: node_modules,
				alias: {
					'scss-loader': 'sass-loader',
				},
			},

			optimization: {
				minimize: $$$.env.isProd,
			},

			externals: {
				vue: 'Vue',
				jquery: 'jQuery'
			},

			plugins: [
				new webpack.DefinePlugin( { ENV: JSON.stringify( $$$.env ) } ),
				new VueLoaderPlugin()
			]
		}
	}
};