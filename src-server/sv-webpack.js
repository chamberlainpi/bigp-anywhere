/**
 * Created by Chamberlain on 2/6/2018.
 */
const fs = require('fs-extra');
const webpack = require('webpack');

function SELF(config) {
	const output = config.output;
	const compiler = webpack(config);

	SELF.isRunning = false;
	SELF.compiler = compiler;
	SELF.fileChanged = output.path.mustEndWith('/').fixSlash() + output.filename;

	if($$$.env==='dev') {
		compiler.inputFileSystem = fs;
		compiler.outputFileSystem =  $$$.memFS;
	} else {
		trace("Webpack will write to /dist folder...");
	}

	return SELF;
}

_.extend(SELF, {
	run(cbWarnings) {
		return new Promise((_then, _catch) => {
			if (SELF.isRunning) return traceError("Already running Webpack...");

			SELF.isRunning = true;

			SELF.compiler.run(function (err, stats) {
				if (err) return _catch(err);

				SELF.isRunning = false;

				const ret = stats.toJson();

				if (ret.errors.length > 0) return _catch(ret.errors);
				if (ret.warnings.length > 0) cbWarnings && cbWarnings(ret.warnings);

				const asset = ret.assets[0];
				const size = (asset.size / 1024).toFixed(2);
				trace([" WEBPACK OK ".bgGreen.white, ` ${size}KB `.bgMagenta.white, asset.name].join(' '));

				const fileChanged = SELF.fileChanged.replace('[name].js', asset.name);
				$$$.io.emit('file-changed', fileChanged);

				_then(stats);
			});
		});
	}
});

module.exports = SELF;