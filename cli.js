#!/usr/bin/env node

const PLUGIN_FILTERS = {filter: 'sv-plug*'};
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

$$$.paths = require('./src/server/sv-paths');
$$$.cmd = require('./src/server/sv-command-exec');

///////////////////////////////////////////////////////////////

if($$$.cmd.isUsingCommand($$$.env)) return;

$$$.config = $$$.mergeIfExists(
	$$$.paths._bpa.src + '/config',
	$$$.paths.src + '/config'
);

$$$.plugins = require('./src/server/sv-plugin-manager').create();
$$$.plugins.isSilent = false;
$$$.plugins
	.loadFromPath($$$.paths._bpa.plugins, PLUGIN_FILTERS)
	.loadFromPath($$$.paths.plugins, PLUGIN_FILTERS)
	.callEach('init')
	.forEach('routes', routes => $$$.plugins.Web.addRoutes(routes))
	.done(() => {

	//For testing purposes, some experiments can be executed here:
	if($$$.env.x) return require($$$.paths.experiments + "/_main.js");

	const isProd = $$$.env.p===true;
	_.extend($$$.env, {
		isProd: isProd,
		isDev: !isProd,
		name: isProd ? 'prod' : 'dev'
	});

	$$$.plugins
		.callEach('configure', $$$.config)
		.callEach('addEvents')
		.callEach('start');
});