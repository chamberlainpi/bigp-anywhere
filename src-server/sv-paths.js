/**
 * Created by Chamberlain on 3/30/2018.
 */

const fs = require('fs-extra');

const _internal = __dirname.fixSlash();
const _root = _internal.removeAfter('/');

const currentDir = process.cwd().fixSlash();

const paths = {
	_bpa: {
		root: _root,
		libs: _internal,
		client: _root + '/src-client',
		public: _root + '/public',
		dist: _root + '/public/dist',
		private: _root + '/.private',
		data: _root + '/.private/data',
		templates: _root + '/templates',
		experiments: _root + '/experiments'
	},

	root: currentDir,
	libs: currentDir + '/src-server',
	client: currentDir + '/src-client',
	public: currentDir + '/public',
	dist: currentDir + '/public/dist',
	private: currentDir + '/.private',
	data: currentDir + '/.private/data',
	templates: currentDir + '/templates',
	experiments: currentDir + '/experiments',
};

module.exports = paths;

module.paths.unshift(paths.root + '/node_modules');

global.requireAuto = function(path) {
	path = (path.has('.') ? path : path + '.js').mustStartWith('/');

	const tryPaths = [
		paths._bpa.libs + path,
		paths._bpa.root + path,
		paths.libs + path,
		paths.root + path,
	];

	for(var t=tryPaths.length; --t>=0;) {
		const tryPath = tryPaths[t];

		if(!fs.existsSync(tryPath)) continue;

		return require(tryPath);
	}

	throw 'Could not resolve local (CWD) -OR- internal (BPA) path: ' + path;
};