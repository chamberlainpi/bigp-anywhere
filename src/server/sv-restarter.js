require( './sv-extensions' );

const cluster = require( "cluster" );

module.exports = function ( cb ) {
    if ( !cluster.isMaster ) {
        trace( "Starting worker process: ".yellow + process.pid );
        return cb();
    }

    traceClear();

    cluster.on( 'exit', ( worker, code, signal ) => {
        console.log( 'Ended process: '.red + worker.process.pid );
        setTimeout( () => {
            traceClear();
            cluster.fork();
        }, 800 );
        
    } );

    trace( "Starting Master process: ".green + process.pid );

    cluster.fork();
}