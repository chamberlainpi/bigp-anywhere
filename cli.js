#!/usr/bin/env node

const EVENTS = require( './src/server/constants' ).EVENTS;

require( './src/server/sv-restarter' )( () => {
	const PLUGIN_FILTERS = { filter: 'sv-plug*' };
	const PluginManager = require( './src/server/sv-plugin-manager' );
	const paths = $$$.paths = require( './src/server/sv-paths' );
	const configPaths = [paths._bpa.src, paths.src, paths.private];

	$$$.config = $$$.mergeIfExists( configPaths, '/config.js' );

	$$$.plugins = new PluginManager();
	$$$.plugins.isSilent = true;
	$$$.plugins.loadFromPath( [paths._bpa.plugins, paths.plugins], PLUGIN_FILTERS )
		.then( p => p.callEach( 'preinit' ) )
		.then( p => p.callEach( 'init' ) )
		.then( p => p.callEach( 'configure' ) )
		.then( p => p.callEach( 'start' ) )
		////////////////////////////////////////////////////////
		.catch( $$$.plugins.errHandler );

	$$$.on( EVENTS.SERVER_READY, () => $$$.plugins.callEach( 'ready' ) );
} );