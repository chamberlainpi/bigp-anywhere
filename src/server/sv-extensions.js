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

_.extend( $$$, {
	filterFiles( path, filter, isRecursive ) {
		if ( _.isString( filter ) ) {
			const str = filter;
			filter = f => f.has( str );
		}

		if ( _.isRegExp( filter ) ) {
			const reg = filter;
			filter = f => reg.test( f );
		}

		if ( _.isArray( path ) ) {
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
					} );
			};

		if ( isRecursive ) {
			return fs.readdir( path ).then( recursiveDirs );
		}

		return fs.readdir( path ).then( filterDirs );
	},
	
	promptFile(params) {
		if(_.isString(params)) params = {path: params};
		else params = params || {};

		let path = params.path || './';
		let ext = params.ext || '.js';
		let includePrivate = params.includePrivate===true;
		path = path.mustEndWith('/');

		return new Promise((_then, _catch) => {
			fs.readdir(path)
				.then(dirs => dirs
					.filter(d => (!includePrivate && !d.startsWith('_')) && d.endsWith(ext))
					.map(d => path + d))
				.then(dirs => {
					const choices = dirs.map(d => d.remove(path));

					return prompt({
							type: 'list',
							name: 'value',
							message: params.message || 'Please select a file:',
							choices: choices,
							default: 0
						});
				})
				.then(choice => _then(path + choice.value))
				.catch(err => _catch(err));
		});
	},

	deferPromise(cb) {
		return new Promise((_then, _catch) => {
			process.nextTick(() => cb(_then, _catch));
		});
	},

	wait( time ) {
		return new Promise( ( _then, _catch ) => {
			setTimeout( _then, time );
		} );
	},

	requireAuto(path) {
		path = (path.has('.') ? path : path + '.js').mustStartWith('/');

		const paths = $$$.paths;
		const tryPaths = [
			paths._bpa.server + path,
			paths._bpa.root + path,
			paths.server + path,
			paths.root + path,
		];

		return $$$.deferPromise((_then, _catch) => {
			for(let t=tryPaths.length; --t>=0;) {
				const tryPath = tryPaths[t];

				if(!fs.existsSync(tryPath)) continue;

				return _then(require(tryPath));
			}

			_catch(new Error('Could not resolve local (CWD) -OR- internal (BPA) path: ' + path));
		});
	},

	requireDir(path, options) {
		if(!options) options = {};
		path = path.mustEndWith('/');

		const matcher = anymatch(options.filter || '*');

		return new Promise((_then, _catch) => {
			fs.readdir(path)
				.then(dirs => dirs
					.filter(d => matcher(d))
					.map(d => require(path.mustEndWith('/') + d)))
				.then(_then)
				.catch(_catch);
		});
	},

	requireIf(path) {
		path = path.has('.') ? path : path + '.js';

		if(!fs.existsSync(path)) return null;

		return require(path);
	},

	mergeIfExists(... paths) {
		const result = {};

		paths.forEach(path => {
			path = path.has('.') ? path : path + '.js';
			if(!fs.existsSync(path)) return;
			_.extend(result, require(path));
		});

		return result;
	}
});

const traceSpecial = header => (o, returnOnly) => {
	const msg = header + ' ' + o;
	!returnOnly && trace(msg);
	return msg;
};

trace.OK = traceSpecial('--OK--'.bgGreen);
trace.FAIL =  traceSpecial('--X--'.bgRed);
