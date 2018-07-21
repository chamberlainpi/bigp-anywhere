#!/usr/bin/env node

const Events = require('events');
global.$$$ = new Events();
global._ = require('lodash');
require('./src/server/extensions');
require('./src/server/extensions-node');
require('colors');

$$$.paths = require('./src/server/sv-paths');

const yargs = require('yargs');
const env = yargs
	.alias('p','prod')
	.alias('v','verbose')
	.alias('x', 'exp')
	.argv;

if(env.x) {
	require($$$.paths.experiments + "/_main.js");
	return;
}

const sv = $$$.paths._bpa.server;

$$$.env = _.extend(env, {
	isProd: env.p===true,
	isDev: !env.p,
	name: env.p===true ? 'prod' : 'dev'
});

require(sv + '/sv-restarter')(null, () => {
	const MFS = require('memory-fs');
	const config = require($$$.paths._bpa.src + '/config');
	const configProject = requireIf($$$.paths.src + '/config');

	_.extend(config, configProject);

	$$$.config = config;
	$$$.memFS = new MFS();
	$$$.web = require(sv + '/sv-web')(config);
	$$$.watcher = require(sv + '/sv-watcher')(config);
	$$$.autoOpen = require(sv + '/sv-auto-open')(config);
	$$$.sass = require(sv + '/sv-sass-compile')(config.sass);
	$$$.webpack = require(sv + '/sv-webpack')(config.webpack);
	$$$.index = requireAuto('index');

	if(_.isFunction($$$.index)) $$$.index(config);

	$$$.webpack.run()
		.then(stats => { /* trace('WEBPACK COMPLETED'); */})
		.catch(err => traceError(err));

	if(process.argv.has('--testing')) {
		require(sv + '/sv-chai-helpers')(global);
	}
});