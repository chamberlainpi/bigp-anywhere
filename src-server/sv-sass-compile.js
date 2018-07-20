/**
 * Created by Chamberlain on 2/5/2018.
 */
const sass = require('node-sass');
const path = require('path');
const moment = require('moment');
const sassRegex = /\.s(a|c)ss$/;

function SELF() {
	$$$.watcher.add(sassRegex, '*', path => renderSass(path));

	const fs = $$$.isProd ? require('fs-extra') : $$$.memFS;
	const cssStyles = $$$.paths.client + '/css/-main.scss';
	const cssPath = $$$.paths.public + '/css/styles.css';

	let lastCompiled = 0;

	function renderSass(dir) {
		var now = new Date().getTime();
		var diff = now - lastCompiled;
		if(diff < 500) return; //trace("Too soon to recompile: " + dir + " : " + diff);

		lastCompiled = now;

		fs.mkdirpSync(cssPath.toPath().dir);

		sass.render({file: cssStyles}, (err, result) => {
			if(err) throw err;

			fs.writeFile(cssPath, result.css, onSassComplete);
		});

		function onSassComplete(err) {
			if(err) throw err;

			$$$.io.emit('file-changed', cssPath);
		}
	}

	return SELF;
}

module.exports = SELF;