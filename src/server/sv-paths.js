const fs = require('fs-extra');

const _internal = __dirname.fixSlash();
const _root = _internal.removeAfter('/src');
const projectRoot = process.cwd().fixSlash();
const paths = _.extend(makePaths(projectRoot), {_bpa: makePaths(_root)});

module.exports = paths;

//Appends the project-dir's /node_modules/ to the resolvable paths:
module.paths.unshift(paths.node_modules.replace('/', '\\'));
module.paths = module.paths.slice(0, -3);

function makePaths(root) {
	const src = root + '/src';

	return {
		root: root,
		src: src,
		client: src + '/client',
		server: src + '/server',
		plugins: src + '/plugins',
		commands: src + '/commands',
		tests: src + '/tests',
		public: root + '/public',
		dist: root + '/public/dist',
		data: root + '/.private/data',
		private: root + '/.private',
		templates: root + '/templates',
		experiments: root + '/experiments',
		node_modules: root + '/node_modules',
	}
}