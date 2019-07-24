module.exports = {
	tags: 'ads, config, filename, generator',
	help: `
Generates filenames list in a 'filenames.txt' and 'config.ini' to upload for previewing HTML5 ads.

  Examples:

   1) cd ./__files/_PSDs
      bpa -c filename
      
   2) cd ./ads
      bpa -c filename
`,

	exec() {
		const root = $$$.paths.root.mustEndWith( '/' );
		const txtFile = root + 'filenames.txt';
		const configFile = root + 'config.ini';

		return $$$.fs.readdir( root )
			.then(list => {
				list = list.map(a => a.split('.')[0]);
				const txtData = list.join('\n');
				const configData = '[English]\n' +
					list.map(a => a + ' = "*.html"')
						.join('\n');

				trace(txtData);

				return Promise.all([
					$$$.fs.writeFile(txtFile, txtData),
					$$$.fs.writeFile(configFile, configData),
				]);
			})
			.then(ok => {
				trace("Wrote file:\n".green + txtFile + "\n" + configFile);
				throw 'exit';
			});
	}
};