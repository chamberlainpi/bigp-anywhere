/**
 * Created by Chamberlain on 2/5/2018.
 */
const sass = require('node-sass');
const moment = require('moment');
const sassRegex = /\.s(a|c)ss$/;

function SELF(config) {
	$$$.watcher.add(sassRegex, '*', path => renderSass(path));

	let lastCompiled = 0;
	const fs = $$$.isProd ? require('fs-extra') : $$$.memFS;

	function renderSass(dir) {
		var now = new Date().getTime();
		var diff = now - lastCompiled;
		if(diff < config.delayUpdate) return; //trace("Too soon to recompile: " + dir + " : " + diff);

		lastCompiled = now;

		fs.mkdirpSync(config.output.toPath().dir);

		sass.render(config.compiler, (err, result) => {
			if(err) throw err;

			fs.writeFile(config.output, result.css, onSassComplete);
		});

		function onSassComplete(err) {
			if(err) throw err;

			$$$.io.emit('file-changed', config.output);
		}
	}

	return SELF;
}

module.exports = SELF;