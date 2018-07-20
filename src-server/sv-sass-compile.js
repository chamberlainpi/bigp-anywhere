/**
 * Created by Chamberlain on 2/5/2018.
 */
const sass = require('node-sass');
const path = require('path');
const moment = require('moment');
const sassRegex = /\.s(a|c)ss$/;

function SELF() {
	$$$.watcher.add(sassRegex, '*', path => renderSass(path));

	let lastCompiled = 0;
	const fs = $$$.isProd ? require('fs-extra') : $$$.memFS;
	const cssStyles = $$$.paths._bpa.client + '/css/-main.scss';
	const cssPath = $$$.paths.public + '/css/styles.css';
	const sassConfig = {
		file: cssStyles,
		includePaths: [
			$$$.paths.client + '/css'
		]
	};

	trace("SASS: " + cssStyles);

	function renderSass(dir) {
		var now = new Date().getTime();
		var diff = now - lastCompiled;
		if(diff < 500) return; //trace("Too soon to recompile: " + dir + " : " + diff);

		lastCompiled = now;

		fs.mkdirpSync(cssPath.toPath().dir);

		sass.render(sassConfig, (err, result) => {
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