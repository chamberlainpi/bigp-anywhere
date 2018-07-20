#!/usr/bin/env node

const Events = require('events');
global.$$$ = new Events();
global._ = require('lodash');
require('./src-server/extensions');
require('./src-server/extensions-node');
require('colors');

$$$.paths = require('./src-server/sv-paths');

const yargs = require('yargs');
const cmdArguments = yargs
	.alias('p','prod')
	.alias('v','verbose')
	.alias('x', 'exp')
	.argv;

if(cmdArguments.x) {
	require($$$.paths.experiments + "/_main.js");
	return;
}

$$$.env = cmdArguments.p ? 'prod' : 'dev';
$$$.isProd = $$$.env === 'prod';
$$$.isDev = !$$$.isProd;

requireAuto('src-server/sv-restarter')(null, () => {
	const MFS = require('memory-fs');
	const config = requireAuto('config');

	//_.extend( , configPriv);

	$$$.config = config;
	$$$.memFS = new MFS();
	$$$.web = requireAuto('sv-web')(config);
	$$$.watcher = requireAuto('sv-watcher')(config);
	$$$.autoOpen = requireAuto('sv-auto-open')(config);
	$$$.sass = requireAuto('sv-sass-compile')();
	$$$.webpack = requireAuto('sv-webpack')(config.webpack);
	$$$.stitch = requireAuto('sv-stitchweb')(config);

	$$$.webpack.run()
		.then(stats => { /* trace('WEBPACK COMPLETED'); */})
		.catch(err => traceError(err));

	if(process.argv.has('--testing')) {
		requireAuto('sv-chai-helpers')(global);
	}
});