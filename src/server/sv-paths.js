const path = require( 'path' );
const _internal = __dirname.fixSlash();
const _root = _internal.removeAfter( '/src' );
const projectRoot = process.cwd().fixSlash();
const paths = _.extend( pathJoin, makePaths(projectRoot), {_bpa: makePaths(_root)}) ;

function pathJoin() {
	return path.join.apply( null, arguments ).fixSlash();
}

module.exports = paths;

//Appends the project-dir's /node_modules/ to the resolvable paths:
module.paths.unshift(paths.node_modules.replace('/', '\\'));
module.paths = module.paths.slice(0, -3);

function makePaths(root) {
	const src = root + '/src';

	return {
		root: root,
		src: src,
		apps: src + '/apps',
		client: src + '/client',
		server: src + '/server',
		plugins: src + '/plugins',
		commands: src + '/commands',
		tests: root + '/tests',
		public: root + '/public',
		dist: root + '/public/dist',
		data: root + '/.private/data',
		private: root + '/.private',
		templates: root + '/templates',
		node_modules: root + '/node_modules',
	}
}