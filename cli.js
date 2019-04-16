#!/usr/bin/env node

const PLUGIN_FILTERS = { filter: 'sv-plug*' };
const PluginManager = require( './src/server/sv-plugin-manager' );
const yargs = require('yargs');
const MFS = require('memory-fs');

require('./src/server/sv-extensions');

traceClear();  

$$$.memFS = new MFS();
$$$.env = yargs
	.alias('p','prod')
	.alias('v','verbose')
	.alias('x', 'exp')
	.alias('c', 'command')
	.alias('?', 'what')
	.argv;

const paths = $$$.paths = require( './src/server/sv-paths' );

///////////////////////////////////////////////////////////////

$$$.config = $$$.mergeIfExists( paths._bpa.src + '/config', paths.src + '/config' );

$$$.plugins = new PluginManager();
$$$.plugins.isSilent = true;
$$$.plugins.init()
	.then( p => p.loadFromPath( [paths._bpa.plugins, paths.plugins], PLUGIN_FILTERS ))
	.then( p => p.callEach( 'preinit' ) )
	.then( p => p.callEach( 'init' ) )
	.then( p => p.forEach( 'routes', routes => $$$.plugins.Web.addRoutes( routes ) ) )
	.then( p => p.callEach( 'configure', $$$.config ) )
	.then( p => p.callEach( 'addEvents' ) )
	.then( p => p.callEach( 'start' ) )

	////////////////////////////////////////////////////////

	.catch( err => {
		if ( err === 'done' ) return trace( "Done.".green );
		if ( err === 'skip' ) return;

		trace.FAIL( "An error occured!".red );
		trace( err );
	})