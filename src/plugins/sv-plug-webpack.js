/**
 * Created by Chamberlain on 8/15/2018.
 */
const EVENTS = require( '../server/constants' ).EVENTS;
const webpack = require( 'webpack' );

let config;

module.exports = class PluginWebpack {
	configure() {
		config = _.result($$$.config, 'webpack');

		const output = config.output;

		this.isRunning = false;
		this.isWarned = false;
		this.compiler = webpack( config );
		this.fileChanged = output.path.mustEndWith( '/' ).fixSlash() + output.filename;
		
		if ( $$$.env.isDev ) {
			trace( "Webpack will write to *MEMORY*...".yellow );
			this.compiler.inputFileSystem = $$$.fs;
			this.compiler.outputFileSystem = $$$.memFS;
		} else {
			trace( "Webpack will write to /dist folder...".yellow );
		}

		$$$.on( EVENTS.FILE_CHANGED, path => {
			if ( path && !path.has( ".vue", ".js" ) ) {
				return $$$.io.emit( EVENTS.FILE_CHANGED, path );
			}

			path && trace( "File that changed: " + path );

			this.run();
		});
	}

	ready() {
		this.run();
	}

	run() {
		if ( this.isRunning ) {
			!this.isWarned && trace.FAIL( "Already running Webpack..." );
			this.isWarned = true;
			return null;
		}

		this.isRunning = true;
		
		return new Promise( ( _then, _catch ) => {
			this.compiler.run( ( err, stats ) => {
				this.isRunning = false;
				this.isWarned = false;

				const ret = stats.toJson();
				
				if ( ret.errors.length > 0 ) return _catch( ret.errors.join( ' \n' ) );

				const asset = ret.assets[0];
				const size = ( asset.size / 1024 ).toFixed( 2 );
				trace( [" WEBPACK OK ".bgGreen.white, ` ${size}KB `.bgMagenta.white, asset.name].join( ' ' ) );

				const actualFile = this.fileChanged.replace( '[name].js', asset.name );

				$$$.io.emit( EVENTS.FILE_CHANGED, actualFile );

				_then(stats);
			} );
		})
		
	}
}