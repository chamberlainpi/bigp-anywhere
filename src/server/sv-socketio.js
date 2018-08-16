const socketIO = require('socket.io');

/**
 * Created by Chamberlain on 8/8/2018.
 */
SELF.ioInit = function(config) {
	const io = SELF.io = $$$.io = socketIO(server, config);
	SELF.sockets = [];
	SELF.handlers = [];

	io.on('connection', socket => {
		SELF.sockets.push(socket);

		DEBUG("Connected: ".yellow + socket.id);

		SELF.handlers.forEach(hd => socket.on(hd.event, hd.cb));

		socket.on('disconnect', () => {
			SELF.sockets.remove(socket);

			DEBUG("Disconnected: ".red + socket.id);
		});
	});
};

SELF.ioAddEvent = function(event, cb) {
	SELF.handlers.push({event:event, cb:cb});

	SELF.sockets.forEach(socket => socket.on(event, cb));
};

module.exports = SELF;
