/**
 * Created by Chamberlain on 8/15/2018.
 */

const socketIO = require('socket.io');

const DEBUG = o => true && trace( ' SOCKET.IO '.bgBlue.white + ' ' + o );

let config;

module.exports = class PluginSocketIO {
	init() {
		this.sockets = [];
		this.handlers = [];

		config = $$$.config.socketIO;

		$$$.io = socketIO( $$$.server, config);
	}

	configure() {
		$$$.io.on( 'connection', socket => {
			this.sockets.push( socket );

			DEBUG( "Connected: ".yellow + socket.id );

			this.handlers.forEach( hd => socket.on( hd.event, hd.cb ) );

			socket.on( 'disconnect', () => {
				this.sockets.remove( socket );

				DEBUG( "Disconnected: ".red + socket.id );
			} );
		} );
	}
}