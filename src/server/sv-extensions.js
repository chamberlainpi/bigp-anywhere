/**
 * Created by Chamberlain on 7/6/2018.
 */
const Events = require('events');
global.$$$ = new Events();
global._ = require('lodash');
require('colors');
require( './extensions' );

global.Promise = require('bluebird');

const fs = $$$.fs = require('fs-extra');
const anymatch = require('anymatch');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const xml2js = require( 'xml2js' );
const xmlParser = new xml2js.Parser();

inquirer.registerPrompt( 'autocomplete', require( 'inquirer-autocomplete-prompt' ) );

const noFunc = v => v;

_.extend( $$$, {
	filterFiles( path, filter, isRecursive ) {
		const errUndefined = 'Cannot pass an *undefined* value in $$$.filterFiles!';

		if ( !path || path == undefined ) throw new Error( errUndefined );
		
		if ( _.isString( filter ) ) {
			const str = filter;
			filter = f => f.has( str );
		}

		if ( _.isRegExp( filter ) ) {
			const reg = filter;
			filter = f => reg.test( f );
		}

		if ( _.isArray( path ) ) {
			path = _.uniq( path );

			if ( path.has( null, undefined ) ) throw new Error( errUndefined );

			const calls = path.map( p => $$$.filterFiles( p, filter, isRecursive ) );

			return Promise.all( calls ).then( $$$.mergeAll );
		}

		const makeFullPath = f => path.mustEndWith( '/' ) + f;

		const filterDirs =
			dirs => dirs
				.filter( filter )
				.map( isRecursive ? noFunc : makeFullPath )

		const recursiveDirs =
			paths => {
				paths = paths.map( makeFullPath );

				var dirsOnly = paths.filter( p => fs.lstatSync( p ).isDirectory() );
				var dirsPromises = dirsOnly.map( dir => $$$.filterFiles( dir, filter, true ) );
				
				return Promise.all( dirsPromises )
					.then( results => {
						paths = paths.concat.apply( paths, results );
						
						return paths.filter( filter );
					});
			};
		
		if ( isRecursive ) {
			return fs.readdir( path ).then( recursiveDirs );
		}
		
		return fs.readdir( path ).then( filterDirs );
	},

	deferPromise( cb ) {
		return new Promise( ( _then, _catch ) => {
			process.nextTick( () => cb( _then, _catch ) );
		} );
	},

	deferArray( arr, timeMS, cbEach ) {
		return new Promise( ( _then, _catch ) => {
			if ( !arr || arr.length === 0 ) return _then();

			const timer = setInterval( () => {
				const item = arr.pop();
				cbEach( item );

				if ( arr.length === 0 ) {
					clearInterval( timer );
					_then();
				}
			}, timeMS );
		} );
	},

	deferExit( timeMS, exitMsg ) {
		exitMsg && trace( exitMsg );
		setTimeout( () => process.exit(), timeMS );
	},

	readFirstAvailable( paths ) {
		if ( !_.isArray( paths ) ) paths = [paths];
		
		return Promise.resolve()
			.then( () => {
				var exists = paths.filter( p => fs.existsSync( p ) );

				if ( exists.length == 0 ) return '';

				return $$$.readFile( exists[0] );
			} );
	},

	requireAuto(path) {
		path = (path.has('.') ? path : path + '.js').mustStartWith('/');

		const paths = $$$.paths;
		const tryPaths = [
			paths._bpa.server,
			paths._bpa.root,
			paths.server,
			paths.root,
		];

		return $$$.deferPromise((_then, _catch) => {
			for(let t=tryPaths.length; --t>=0;) {
				const tryPath = tryPaths[t].mustEndWith( '/', false ) + path;

				if(!fs.existsSync(tryPath)) continue;

				return _then(require(tryPath));
			}

			_catch(new Error('Could not resolve local (CWD) -OR- internal (BPA) path: ' + path));
		});
	},

	requireMerge( path, tryPaths ) {
		path = ( path.has( '.' ) ? path : path + '.js' ).mustStartWith( '/' );

		if ( !tryPaths ) tryPaths = $$$._requireAuto.tryPaths;

		const results = {};

		return $$$.deferPromise( ( _then, _catch ) => {
			for ( let t = tryPaths.length; --t >= 0; ) {
				const tryPath = tryPaths[t].mustEndWith( '/', false ) + path;

				if ( !fs.existsSync( tryPath ) ) continue;

				const temp = require( tryPath );
				_.merge( results, temp );
			}

			if ( !results ) return _catch( new Error( 'Could not resolve local (CWD) -OR- internal (BPA) path: ' + path ) );

			_then( results );
		} );
	},
	
	requireDir( path, options ) {
		if ( !options ) options = {};
		path = path.mustEndWith( '/' );

		const matcher = anymatch( options.filter || '*' );

		return new Promise( ( _then, _catch ) => {
			fs.readdir( path )
				.then( dirs => dirs
					.filter( d => matcher( d ) )
					.map( d => require( path.mustEndWith( '/' ) + d ) ) )
				.then( _then )
				.catch( _catch );
		} );
	},

	requireIf( path ) {
		path = path.has( '.' ) ? path : path + '.js';

		if ( !fs.existsSync( path ) ) return null;

		return require( path );
	},

	mergeIfExists( paths, suffix ) {
		const result = {};

		if ( suffix ) {
			paths = paths.map( p => p + suffix );
		}

		paths.forEach(path => {
			path = path.has('.js') ? path : path + '.js';
			if(!fs.existsSync(path)) return;
			_.extend(result, require(path));
		});

		return result;
	},

	readFile( file ) {
		return fs.readFile( file, 'utf8' );
	},

	readJSON( file, def, opts ) {
		return Promise.resolve()
			.then( () => {
				if ( !fs.existsSync( file ) ) {
					trace( 'JSON file not found, using default data...'.yellow );
					return def;
				}

				return fs.readJSON( file, opts );
			} );
	},

	writeFile( file, content ) {
		return fs.writeFile( file, content, 'utf8' );
	},

	parseXMLFile( file ) {
		return fs.readFile( file ).then( $$$.parseXML );
	},

	parseXML( data ) {
		return new Promise( ( _then, _catch ) => {
			xmlParser.parseString( data, ( err, parsed ) => {
				if ( err ) return _catch( err );

				_then( parsed );
			} );
		} );
	},

	mergeAll( arrays ) {
		return Array.prototype.concat.apply( [], arrays );
	},

	///////////// PROMPTS AND CONFIRMATIONS:

	promptFile( params ) {
		if ( _.isString( params ) ) params = { path: params };
		else params = params || {};

		let path = params.path || './';
		let ext = params.ext || '.js';
		let includePrivate = params.includePrivate === true;
		path = path.mustEndWith( '/' );

		return new Promise( ( _then, _catch ) => {
			fs.readdir( path )
				.then( dirs => dirs
					.filter( d => ( !includePrivate && !d.startsWith( '_' ) ) && d.endsWith( ext ) )
					.map( d => path + d ) )
				.then( dirs => {
					const choices = dirs.map( d => d.remove( path ) );

					return prompt( {
						type: 'list',
						name: 'value',
						message: params.message || 'Please select a file:',
						choices: choices,
						default: 0
					} );
				} )
				.then( choice => _then( path + choice.value ) )
				.catch( err => _catch( err ) );
		} );
	},

	promptAutoComplete( msg, opts ) {
		if ( !opts ) opts = {};

		opts = _.merge( {
			type: 'autocomplete',
			name: 'response',
			suggestOnly: false,
			pageSize: 8,
			message: msg,
			onChange: null,

			validate( val ) {
				return val ? true : 'Type something!';
			},

			source( answers, input ) {
				input = input || '';

				return new Promise( ( _then, _catch ) => {
					opts.onChange( _then, _catch, input, answers );
				} );
			}
		}, opts );

		if ( !opts.onChange || opts.onChange.length !== 4 ) throw 'Must supply "autocomplete" prompts with a "onChange(_then, _catch, input, answers)" callback!';

		return $$$.inquirer.prompt( opts ).then( answer => answer.response );
	},

	promptChoice( msg, choices, opts ) {
		const isArray = _.isArrayLike( choices );

		if ( _.isString( opts ) ) opts = { default: opts };

		opts = _.merge( {
			name: 'response',
			type: 'list',
			choices: isArray ? choices : _.keys( choices ),
			message: msg,
			onChoice: null,
		}, opts );

		return $$$.prompt( opts ).then( answer => {
			const response = isArray ? answer.response : choices[answer.response];

			opts.onChoice && opts.onChoice( answer.response );

			if ( _.isFunction( response ) ) return response();
			return response;
		} );
	},

	promptCheckboxes( msg, choices, def, customFilter ) {
		if ( _.isBoolean( def ) ) choices = choices.map( a => ( { name: a, checked: def } ) );
		else if ( _.isArray( def )) {
			if ( def.length == choices.length && _.isBoolean( def[0] ) ) {
				choices = choices.map( ( a, id ) => ( { name: a, checked: def[i] } ) );
			} else {
				choices = choices.map( ( a, id ) => ( { name: a, checked: def.indexOf(a) > -1} ) );
			}
		} else {
			throw 'Unsupported default value type: ' + (def + ' is a ' + typeof ( def )).bgWhite.red;
		}

		return $$$.prompt( {
			message: msg,
			type: 'checkbox',
			name: 'response',
			choices: choices,
			filter: customFilter,
			pageSize: 9999,
		} ).then( answer => {
			return _.isArray( answer.response ) ? answer.response : [];
		})
	},

	prompt( opts ) {
		return $$$.inquirer.prompt( opts );
	},

	promptText( msg, def ) {
		return $$$.prompt( {
			name: 'response',
			type: 'input',
			message: msg,
			onChoice: null,
			default: def
		} ).then( answer => answer.response );
	},

	promptYesNo( msg, def ) {
		return $$$.promptText( msg + " (y=yes, n=no)", def )
			.then( r => r && r.length > 0 && r.toLowerCase()[0] == 'y' );
	},

	promptEnter() {
		return $$$.promptText( "  Press ENTER to continue. (CTRL+C to exit)" );
	},

	/////////////////////////////////////////////

	systemEnv( str ) {
		return str.replace( /%([^%]+)%/g, ( _, n ) => process.env[n] );
	},

	resError( res, message ) {
		trace.FAIL( message );
		//res.message = message;
		res.status( 404 ).send( message );
	},
	
	/////////////////////////////////////////////

	JsonHandler(file, def) {
		const inst = new JsonHandler();
		inst.data = null;
		inst.file = file;
		inst.load( def );

		return inst;
	},
} );

class JsonHandler extends Events{
	save() {
		const filepath = this.file.toPath();

		return fs.mkdirp( filepath.dir )
			.then( () => fs.writeJSON( this.file, this.data, { spaces:'  '} ))
			.then( () => trace.OK( 'JSON written OK!' ) );
	}

	json() {
		return JSON.stringify( this.data, null, '  ' );
	}

	load(def) {
		return $$$.readJSON( this.file, def )
			.then( data => {
				this.data = data;
				this.emit( 'loaded', this );
				return this;
			} );
	}

	then( fn ) {
		return new Promise( ( _then, _catch ) => {
			this.on( 'loaded', function () {
				fn && fn();
				_then();
			} );
		} );
	}
}