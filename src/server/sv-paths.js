/**
 * Created by Chamberlain on 3/30/2018.
 */

const fs = require('fs-extra');

const _internal = __dirname.fixSlash();
const _root = _internal.removeAfter('/src');
const projectRoot = process.cwd().fixSlash();
const paths = _.extend(makePaths(projectRoot), {_bpa: makePaths(_root)});

module.exports = paths;

// module.paths.unshift(paths.node_modules.replace('/', '\\'));
// module.paths = module.paths.slice(0, -3);

global.requireAuto = function(path) {
	path = (path.has('.') ? path : path + '.js').mustStartWith('/');

	const tryPaths = [
		paths._bpa.server + path,
		paths._bpa.root + path,
		paths.server + path,
		paths.root + path,
	];

	for(var t=tryPaths.length; --t>=0;) {
		const tryPath = tryPaths[t];

		if(!fs.existsSync(tryPath)) continue;

		return require(tryPath);
	}

	throw 'Could not resolve local (CWD) -OR- internal (BPA) path: ' + path;
};

global.requireIf = function(path) {
	path = path.has('.') ? path : path + '.js';

	if(!fs.existsSync(path)) return null;

	return require(path);
};

function makePaths(root) {
	const src = root + '/src';

	return {
		root: root,
		src: src,
		node_modules: root + '/node_modules',
		client: src + '/client',
		server: src + '/server',
		tests: src + '/tests',
		public: root + '/public',
		dist: root + '/public/dist',
		private: root + '/.private',
		data: root + '/.private/data',
		templates: root + '/templates',
		experiments: root + '/experiments'
	}
}