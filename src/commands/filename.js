const txtFile = $$$.paths.root.mustEndWith('/') + 'filenames.txt';
const configFile = $$$.paths.root.mustEndWith('/') + 'config.ini';

$$$.fs.readdir($$$.paths.root)
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