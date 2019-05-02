/**
 * Created by Chamberlain on 8/15/2018.
 */
const EVENTS = require( '../server/constants' ).EVENTS;

const chokidar = require( 'chokidar' );
const anymatch = require( 'anymatch' );
const check = {
	hasPublic: p => p.has( 'public/' ) || p.has( 'client/' ) || p.has( 'apps/' ),
	hasDist: p => p.has('dist/')
}

const defaultIgnored = [/node_modules/, /package\.json/, /\.(git|idea|private|gitignore|lock|vscode)/, /_old/];
let config, watcher, times = {}, handles = [];

module.exports = class PluginWatcher {
	configure() {
		config = $$$.config.watcher || {};

		if ( !config.dir ) config.dir = ['.', $$$.paths.root];
		config.ignored = [].concat( defaultIgnored, config.ignored );

		times.start = $$$.now();
		times.startSkip = config.timeStartSkip || 5000;

		watcher = this.watcher = chokidar.watch( config.dir, config );
		watcher.on( 'all', this.onGlobalFileChanged.bind( this ) );
		
		this.add( /\./, '*', this.onFileChanged.bind( this ) );
	}

	onGlobalFileChanged( event, path ) {
		path = path.fixSlash();

		times.now = $$$.now();
		times.diff = times.now - times.start;
		
		if ( event === 'addDir' || path.has( '_tmp_' ) || ( event === 'add' && times.diff < times.startSkip ) ) {
			return;
		}

		handles.forEach( handle => {
			const isEventOK = handle.event === '*' || handle.event === event;
			if ( !isEventOK || !handle.matcher( path ) ) return;
			handle.cb( event, path );
		})
	}

	onFileChanged( event, path ) {
		trace( "CHOKIDAR (2s): " + event + " : " + path );

		$$$.wait( 2000 )
			.then( () => {
				if ( event === 'change' && check.hasPublic( path ) ) {
					this.onPublicChanged( path );
				} else {
					this.onServerChanged( path );
				}
			} );
		
	}

	onPublicChanged( path ) {
		$$$.emit( EVENTS.FILE_CHANGED, path );
	}

	onServerChanged( path ) {
		trace( "Server file changed..." );
		trace( path );

		process.exit();
	}

	add( pattern, event, cb ) {
		if ( arguments.length === 2 ) {
			cb = event;
			event = 'change'
		}
		
		handles.push( { matcher: anymatch( pattern ), event: event, cb: cb } )
	}
}