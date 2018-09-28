const fs = require('fs-extra');
const url = require('url');
const http = require('http');
const mime = require('mime-types');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const server = http.createServer(app);

const DEBUG = true ? () => {} : trace.apply(null, arguments);

$$$.fullUrl = function(req) {
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
		pathname: req.originalUrl
	});
}

function SELF(config) {
	if(!config.web) throw 'Missing "config.web" field in configuration file.';

	SELF.config = config;
	SELF.app = app;
	SELF.express = express;
	SELF.server = server;

	//app.set('trust proxy', 1);
	app.use(cookieSession(config.cookieSession));
	app.use(cookieParser(config.session.secret));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	SELF.ioInit(config.io || {});

	SELF.setupRoutes(config.web.routes);

	return SELF;
}

SELF.start = function() {
	SELF.processRoutes();

	trace("Starting...");

	SELF.listen(SELF.config.web.port);
};

SELF.onError = (err, req, res, next) => {
	trace(err);
	res.status(404).send();
};

SELF.memoryMiddleware = function(req, res, next) {
	const localURI = $$$.paths.public + req.url.before('?');
	if(!req.url.has('.') || !$$$.memFS.existsSync(localURI)) {
		return next();
	}

	res.contentType(mime.lookup(localURI));
	return res.send($$$.memFS.readFileSync(localURI));
};

const routeQueues = [];
SELF.setupRoutes = function(routes) {
	routeQueues.unshift(routes);

	return SELF;
};

SELF.processRoutes = function() {
	process.nextTick(() => {
		while(routeQueues.length>0) {
			SELF._processRoute(routeQueues.pop());
		}

		app.use(SELF.config.web.onError || SELF.onError);
	})
};

SELF._processRoute = function(routes) {
	function _recursive(parent, path, routes) {
		DEBUG("ROUTE: " + path);
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
						DEBUG("ROUTE FROM MEMORY: " + routeKey);
						return router.get(routeKey, SELF.memoryMiddleware);
					} else if(routeKey.has('.')) {
						DEBUG("ROUTE DIRECT FILE: " + routeKey);
						return router.get(routeKey, (req, res, next) => {
							res.sendFile(obj);
						});
					} else if(fs.existsSync(obj)) {
						DEBUG("ROUTE STATIC DIR: " + obj);
						return router.use(express.static(obj));
					} else {
						DEBUG("ROUTE STRING: " + obj);
						return router.get(routeKey, (req, res, next) => res.send(obj));
					}
				}

				if(!_.isFunction(obj)) return _recursive(router, routeKey, obj);

				const routeArr = routeKey.split('::');
				const method = routeArr.length===1 ? 'get' : routeArr[0].toLowerCase();
				const subPath = routeArr.length===1 ? routeArr[0] : routeArr[1];

				DEBUG("ROUTE MIDDLEWARE: " + method.toUpperCase() + "::" + subPath);

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
		DEBUG("Setting router: " + path);
		parent.use(path, router);
	}

	_recursive(app, '/', routes);
};

SELF.listen = function(port) {
	server.listen(port || 3000, () => {
		trace(`STARTED SERVER ON PORT ${port} ...`.yellow);
	});

	return SELF;
};

module.exports = SELF;
