const clipy = require("clipboardy");

trace("LISTING!!! " + $$$.paths.root);

$$$.fs.readdir($$$.paths.root)
    .then(list => {
        list = list.map(a => a.split('.')[0]);
        
        trace(list);
        clipy.writeSync(list.join('\n'));
        trace("Copied to clipboard.".green);

    })
    .catch(err => {
        traceError(err);
    });