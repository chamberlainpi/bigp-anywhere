/**
 * Created by Chamberlain on 8/29/2018.
 */

let indexURI;

module.exports = class PluginIndexFinder {
    init() {
        indexURI = $$$.paths.root + '/index.js';

        this.hasIndexFile = $$$.fs.existsSync( indexURI );
    }

    start() {
        if ( !this.hasIndexFile ) return;

        require( indexURI );
    }
}