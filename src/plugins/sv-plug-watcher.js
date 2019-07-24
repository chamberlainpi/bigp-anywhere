/**
 * Created by Chamberlain on 8/15/2018.
 */
const EVENTS = require( '../server/constants' ).EVENTS;

const chokidar = require( 'chokidar' );
const anymatch = require( 'anymatch' );
const check = {
	hasPublic: p => p.has( 'public/' ) || p.has( '/apps/' ),
	hasDist: p => p.has('dist/')
}

const defaultIgnored = [/node_modules/, /package\.json/, /\.(git|idea|private|gitignore|lock|vscode)/, /_old/];
let config, watcher, handles = [];

module.exports = class PluginWatcher {
	configure() {
		config = $$$.config.watcher || {};

		if ( !config.dir ) config.dir = ['.', $$$.paths.root];
		config.ignored = [].concat( defaultIgnored, config.ignored );

		const delayStart = config.delayStart || 5000;

		watcher = this.watcher = chokidar.watch( config.dir, config );
		
		setTimeout( () => {
			trace.OK( `File-Watcher started. (delayed: ${delayStart}ms)` );
			watcher.on( 'all', this.onGlobalFileChanged.bind( this ) );
		}, delayStart );
		
		this.isBusy = false;

		this.add( /\./, '*', this.onFileChanged.bind( this ) );
	}

	onGlobalFileChanged( event, path ) {
		path = path.fixSlash();
		
		if ( event.has( 'add' ) || path.has( '_tmp_' ) ) return;

		handles.forEach( handle => {
			const isEventOK = handle.event === '*' || handle.event === event;
			if ( !isEventOK || !handle.matcher( path ) ) return;
			handle.cb( event, path );
		})
	}

	onFileChanged( event, path ) {
		if ( this.isBusy ) return;

		this.isBusy = true;

		const _notify = type => {
			const delayPost = config.delayPost || 1000;
			trace( `${event.bgGreen} in /${type}/ (${delayPost}ms): ${path.green}` );

			return $$$
				.wait( delayPost )
				.then( () => this.isBusy = false );
		}

		if ( event === 'change' && check.hasPublic( path ) ) {
			_notify( 'public'.cyan ).then( () => this.onPublicChanged( path ) );
		} else {
			_notify( 'server'.yellow ).then( () => this.onServerChanged( path ) );
		}
	}

	onPublicChanged( path ) {
		$$$.emit( EVENTS.FILE_CHANGED, path );
	}

	onServerChanged( path ) {
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