module.exports = {
	help: `
Generates filenames list in a 'filenames.txt' and 'config.ini' to upload for previewing HTML5 ads.

  Examples:

   1) cd ./__files/_PSDs
      bpa -c filename
      
   2) cd ./ads
      bpa -c filename
`,

	exec() {
		const txtFile = $$$.paths.root.mustEndWith('/') + 'filenames.txt';
		const configFile = $$$.paths.root.mustEndWith('/') + 'config.ini';

		return $$$.fs.readdir($$$.paths.root)
			.then(list => {
				list = list.map(a => a.split('.')[0]);
				const listData = list.join('\n');
				const configData = '[English]\n' +
					list.map(a => a + ' = "*.html"')
						.join('\n');

				trace(listData);

				return Promise.all([
					$$$.fs.writeFile(txtFile, listData),
					$$$.fs.writeFile(configFile, configData),
				]);
			})
			.then(ok => {
				trace("Wrote file:\n".green + txtFile + "\n" + configFile);
			})
			.catch(err => {
				traceError(err);
			});
	}
};