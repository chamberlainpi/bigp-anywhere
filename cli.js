#!/usr/bin/env node

const PLUGIN_FILTERS = { filter: 'sv-plug*' };
const PluginManager = require( './src/server/sv-plugin-manager' );

require('./src/server/sv-extensions');

traceClear();  

const paths = $$$.paths = require( './src/server/sv-paths' );

///////////////////////////////////////////////////////////////

const configPaths = [paths._bpa.src, paths.src, paths.private];

$$$.config = $$$.mergeIfExists( configPaths.map( p => p + '/config.js') );

$$$.plugins = new PluginManager();
$$$.plugins.isSilent = true;
$$$.plugins.loadFromPath( [paths._bpa.plugins, paths.plugins], PLUGIN_FILTERS )
	.then( p => p.callEach( 'preinit' ) )
	.then( p => p.callEach( 'init' ) )
	.then( p => p.forEach( 'routes', routes => $$$.plugins.Web.addRoutes( routes ) ) )
	.then( p => p.callEach( 'configure', $$$.config ) )
	.then( p => p.callEach( 'addEvents' ) )
	.then( p => p.callEach( 'start' ) )

	////////////////////////////////////////////////////////

	.catch( $$$.plugins.errHandler );