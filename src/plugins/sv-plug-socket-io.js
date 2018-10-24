/**
 * Created by Chamberlain on 8/15/2018.
 */

const socketIO = require('socket.io');

const DEBUG = o => false && trace(o);

module.exports = class PluginSocketIO {
	init() {
		this.sockets = [];
		this.handlers = [];

		$$$.io = socketIO($$$.server, $$$.config.socketIO);
	}

	configure() {

	}

	addEvents() {

		$$$.io.on('connection', socket => {
			this.sockets.push(socket);

			DEBUG("Connected: ".yellow + socket.id);

			this.handlers.forEach(hd => socket.on(hd.event, hd.cb));

			socket.on('disconnect', () => {
				this.sockets.remove(socket);

				DEBUG("Disconnected: ".red + socket.id);
			});
		});
	}
}