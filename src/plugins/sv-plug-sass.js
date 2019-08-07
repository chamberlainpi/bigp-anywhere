/**
 * Created by Chamberlain on 8/15/2018.
 */
const sass = require( 'node-sass' );
const EVENTS = require( '../server/constants' ).EVENTS;

const times = { last: 0, now: 0, diff: 0 };
let config, fs;

module.exports = class PluginSass {
	configure() {
		config = _.result( $$$.config, 'sass' );
		if ( !config.delayBlocker ) config.delayBlocker = 250;
		if ( !config.delayEach ) config.delayEach = 100;

		this.isUsingMem = !$$$.env.isProd;
		fs = this.isUsingMem ? $$$.memFS : require( 'fs-extra' );

		
		$$$.on( EVENTS.FILE_CHANGED, path => {
			if ( !path.endsWith( '.scss' ) && !path.endsWith('.sass')) return;

			setTimeout( () => this.run(), config.delayEach );
		} );
	}

	ready() {
		this.run();
	}

	run() {
		times.now = $$$.now();
		times.diff = times.now - times.last;
		if ( times.diff < config.delayBlocker ) return trace.FAIL("Too soon to recompile: " + dir + " : " + diff);

		times.last = times.now;

		fs.mkdirpSync( config.output.toPath().dir );
		
		this.sassPromise( config.compiler )
			.then( res => this.onSassRendered( res ) )
			.then( res => this.onSassComplete( res ) )
			/////////////////////////////
			.catch( err => {
				trace.FAIL( "Error in Sass-Compiler..." );
				trace( err );
			} );
	}

	sassPromise( opts ) {
		return new Promise( ( _then, _catch ) => {
			sass.render( opts, ( err, result ) => {
				if ( err ) return _catch( err );
				_then( result );
			} );
		} );
	}

	onSassRendered( result ) {
		return new Promise( ( _then, _catch ) => {
			if ( this.isUsingMem ) {
				fs.writeFile( config.output, result.css, err => {
					if ( err ) return _catch( err );
					_.deferFrames( 2, _then );
				} );

				return;
			}
			
			fs.writeFile( config.output, result.css )
				.then( _then );
		})
	}

	onSassComplete() {
		trace( "  SASS  OK  ".bgMagenta + ' ' + config.output + (this.isUsingMem ? ' *MEMORY*'.yellow : '') );
		$$$.io.emit( EVENTS.FILE_CHANGED, config.output );
	}
}