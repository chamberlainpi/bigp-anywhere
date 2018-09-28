#!/usr/bin/env node

const yargs = require('yargs');
const MFS = require('memory-fs');

require('./src/server/sv-extensions');

traceClear();

$$$.memFS = new MFS();
$$$.env = yargs
	.alias('p','prod')
	.alias('v','verbose')
	.alias('x', 'exp')
	.argv;

$$$.paths = require('./src/server/sv-paths');
$$$.plugins = require('./src/server/sv-plugin-manager').create();
$$$.plugins
	.loadFromPath($$$.paths._bpa.plugins)
	.loadFromPath($$$.paths.plugins)
	.callEach('init')
	.forEach('routes', routes => $$$.plugins.Web.addRoutes(routes))
	.done(onReady);

$$$.plugins.isSilent = false;

loadConfig();

function onReady() {
	//For testing purposes, some experiments can be run here:
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
}

function loadConfig() {
	$$$.config = $$$.mergeIfExists(
		$$$.paths._bpa.src + '/config',
		$$$.paths.src + '/config'
	);

}