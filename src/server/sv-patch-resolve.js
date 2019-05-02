const path = require( 'path' );
const resolve = require( 'resolve' );
const sync = resolve.sync;

module.exports = function patch(opts) {
    function resync( x, options ) {
        var dir = options.basedir.fixSlash();
        
        if ( dir.has( opts.from ) ) {
            options.basedir = path.resolve( dir.replace( opts.from, opts.to ) );
        }

        return sync( x, options );
    }

    resolve.sync = resync;

};