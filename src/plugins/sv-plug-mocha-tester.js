/**
 * Created by Chamberlain on 8/15/2018.
 */

const MochaClass = require( 'mocha' );
const assert = require( 'chai' ).assert;
const axios = require( 'axios' );

var mocha;

var testPaths;

module.exports = class PluginMochaTester {
	configure() {
		if ( !$$$.env.test ) return;

		this.extendGlobals();

		testPaths = [$$$.paths._bpa.tests, $$$.paths.tests];

		trace( "Preparing to run mocha-chai test cases...".green );
		
		mocha = new MochaClass( $$$.config.mocha || {bail:true} );

		const addTests = files => files.forEach( f => mocha.addFile( f ) )

		return $$$.filterFiles( testPaths, '.js' )
			.then( files => {
				files.sort();
				return files;
			} )
			.then( addTests );
	}

	extendGlobals() {
		const _this = this;

		global.shared = {};
		global.assert = assert;
		global.testCase = function testCase( title, obj ) {
			MochaClass.describe( title, () => {
				_.forIn( obj, ( fn, prop ) => _this.detectTestType( title, prop, fn ) );
			})
		}
	}

	detectTestType( title, prop, fn ) {
		const rxRequestFormat = /^[a-z]*\:\:/i;
		
		var propRequest = prop.replaceBrackets( global.shared );

		MochaClass.it( prop, done => {
			var pre = fn;
			this.currentRequest = null;

			if ( rxRequestFormat.test(prop) ) {
				const req = this.parseRequest( propRequest );
				const smartFunc = this.parseSmartFunc( req, fn );
				pre = axios[req.method]( req.url )
					.then( smartFunc )
					.catch( err => {
						trace.FAIL( `${req.url.red} -- ${req.comment.yellow} - ${err.message.replace( /([0-9]+)/g, '$1'.red )}` );
						done( err );
					})
			}

			Promise.resolve()
				.then( pre )
				.then( done )
				.catch( err => done( err ))
		});
	}

	parseRequest( prop ) {
		const propSplit = prop.split( '::' );
		const host = $$$.plugins.Web.localhost;
		const urlSplit = propSplit[1].split( '--' );
		const urlPath = urlSplit[0].trim();

		return this.currentRequest = {
			method: propSplit[0].toLowerCase(),
			url: host + urlPath,
			suffix: urlPath.split('/').pop(),
			comment: urlSplit.length > 1 ? urlSplit[1].trim() : '',
			host: host,
			raw: prop
		}
	}

	parseSmartFunc( req, fn ) {
		const rxFuncParams = /\(([a-z0-9 _\,]*)*\) \{/i
		const matches = fn.toString().match( rxFuncParams );
		
		if ( !matches || matches.length < 2 ) return null;

		const params = matches[1].toCleanArray();
		
		return ax => {
			const values = params.map( prop => {
				if ( prop == 'ax' ) return ax;
				if ( prop == 'data' ) return ax.data;
				return _.isObject( ax.data ) && (prop in ax.data) ? ax.data[prop] : ax;
			});
			
			return fn.apply( null, values );
		}
	}

	ready() {
		if ( !$$$.env.test ) return;

		return this.mochaRun()
			.then( status => {
				if ( !status.isOK ) {
					if ( this.currentRequest ) {
						trace.FAIL( "Current Request:\n" + this.currentRequest.raw.red );
					}
				} else {
					trace.OK( "SUCCESS!" );
				}
			} )

			.catch( err => {
				trace.FAIL( "FAILED TESTS!" );
				var stack = err.stack.split( '\n' );
				
				trace( stack[1].trim().remove('at ') + ": "  + err.message.red );
			});
	}

	mochaRun() {
		return new Promise( ( _then, _catch ) => {
			mocha.run( failures => _then( { failures: failures, isOK: !failures } ) );
		} );
	}
}