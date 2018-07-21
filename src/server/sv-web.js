const fs = require('fs-extra');
const url = require('url');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const http = require('http');
const mime = require('mime-types');
const server = http.createServer(app);
const socketIO = require('socket.io');
//const passport = require('passport');
//const redis = require('redis');
//const RedisStore = require('connect-redis')(session);

function debug() { } //trace.apply(null, arguments);

$$$.fullUrl = function(req) {
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
		pathname: req.originalUrl
	});
}

function SELF(config) {
	if(!config.web) throw 'Missing "config.web" field in configuration file.';

	SELF.app = app;
	SELF.express = express;
	SELF.server = server;


	//app.set('trust proxy', 1);
	app.use(cookieSession(config.cookieSession));
	app.use(cookieParser(config.session.secret));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	//const redisConf = _.extend(config.redisStore, {client: redis.createClient()});
	//const sessionConfig = _.extend(config.session, {store: new RedisStore(redisConf)});
	//app.use(session(sessionConfig));

	//app.use(passport.initialize());
	//app.use(passport.session());
	//trace("SESSION ADDED with PASSPORT...".cyan);

	SELF.ioInit(config.io || {});

	SELF.setupRoutes(config.web.routes);

	process.nextTick(() => {
		app.use(config.web.onError || SELF.onError);

		SELF.listen(config.web.port);
	});

	return SELF;
}

SELF.onError = (err, req, res, next) => {
	trace(err);
	res.status(404).send();
};

SELF.serveFromMemory = function(req, res, next) {
	const localURI = $$$.paths.public + req.url.split('?')[0];
	if(!req.url.has('.') || !$$$.memFS.existsSync(localURI)) {
		return next();
	}

	res.contentType(mime.lookup(localURI));
	return res.send($$$.memFS.readFileSync(localURI));
};

SELF.setupRoutes = function(routes) {
	function _recursive(parent, path, routes) {
		debug("ROUTE: " + path);
		let router = express.Router();

		_.keys(routes).forEach(routeKey => {
			let routeObj = routes[routeKey];

			if(!_.isArray(routeObj)) routeObj = [routeObj];
			if(routeKey==='^') {
				routeKey = '/*';
				router = app;
			}

			routeObj.forEach(obj => {
				if(_.isString(obj)) {
					if(obj.toUpperCase()==='*MEMORY*') {
						debug("ROUTE FROM MEMORY: " + routeKey);
						return router.get(routeKey, SELF.serveFromMemory);
					} else if(routeKey.has('.')) {
						debug("ROUTE DIRECT FILE: " + routeKey);
						return router.get(routeKey, (req, res, next) => {
							res.sendFile(obj);
						});
					} else if(fs.existsSync(obj)) {
						debug("ROUTE STATIC DIR: " + obj);
						return router.use(express.static(obj));
					} else {
						debug("ROUTE STRING: " + obj);
						return router.get(routeKey, (req, res, next) => res.send(obj));
					}
				}

				if(!_.isFunction(obj)) return _recursive(router, routeKey, obj);

				const routeArr = routeKey.split('::');
				const method = routeArr.length===1 ? 'get' : routeArr[0].toLowerCase();
				const subPath = routeArr.length===1 ? routeArr[0] : routeArr[1];

				debug("ROUTE MIDDLEWARE: " + method.toUpperCase() + "::" + subPath);

				if(obj.length===0) {
					//Must be some sort of special chained route:
					const routeChains = obj();
					trace("ROUTE CHAINS... " + routeChains.length);

					router[method].apply(router, [subPath].concat(routeChains));
				} else {
					router[method](subPath, obj);
				}
			});
		});

		if(parent===router) return;

		//Attach the route to the APP or PARENT-ROUTE:
		parent.use(path, router);
	}

	_recursive(app, '/', routes);

	return SELF;
};

SELF.listen = function(port) {
	server.listen(port || 3000, () => {
		trace(`STARTED SERVER ON PORT ${port} ...`.yellow);
	});

	return SELF;
};

SELF.ioInit = function(config) {
	const io = SELF.io = $$$.io = socketIO(server, config);
	SELF.sockets = [];
	SELF.handlers = [];

	io.on('connection', socket => {
		SELF.sockets.push(socket);

		debug("Connected: ".yellow + socket.id);

		SELF.handlers.forEach(hd => socket.on(hd.event, hd.cb));

		socket.on('disconnect', () => {
			SELF.sockets.remove(socket);

			debug("Disconnected: ".red + socket.id);
		});
	});
};

SELF.ioAddEvent = function(event, cb) {
	SELF.handlers.push({event:event, cb:cb});

	SELF.sockets.forEach(socket => socket.on(event, cb));
};

module.exports = SELF;
