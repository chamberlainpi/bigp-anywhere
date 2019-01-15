/**
 * Created by Chamberlain on 8/9/2018.
 */
const fs = require('fs-extra');
const url = require('url');
const http = require('http');
const mime = require('mime-types');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const obj2routes = require('../server/sv-obj-2-routes');
const app = $$$.app = express();
const server = $$$.server = http.createServer(app);

const config = $$$.config.web;
if(!config.port) config.port = 3333;

module.exports = class PluginWeb {
	init() {
		this._dynamicRouter = null;
		this._dynamicObject = {};
		this._isRoutesDirty = false;
	}

	configure(config) {
		app.use('/', this.middlewareDynamic.bind(this));
		app.use(this.middlewareErrors);

		this.addRoutes(config.web.routes);
	}

	addEvents() {}

	start() {
		server.listen(config.port, () => {
			trace("  *STARTED*  ".bgGreen + ' http://localhost:' + config.port);
		})
	}

	//////////////////////////////////////////////////////////////

	addRoutes(obj) {
		if(!obj) return null;

		_.extend(this._dynamicObject, obj);

		this.dirtyRoutes();

		return obj;
	}

	dirtyRoutes() {
		if(this._isRoutesDirty) return;

		this._isRoutesDirty = true;

		process.nextTick(() => {
			this._isRoutesDirty = false;

			if(!this._dynamicObject) {
				this._dynamicRouter = null;
				return;
			}

			this._dynamicRouter = obj2routes(this._dynamicObject, {
				app:app,
				express:express,
				memoryMiddleware: this.middlewareFromMemory.bind(this)
			});
		});
	}

	clearRoutes() {
		this._dynamicObject = {};
		this._dynamicRouter = null;
	}

	middlewareDynamic(req, res, next) {
		if (!this._dynamicRouter) {
			traceOnce(req.url, 'No dynamic router available!');
			return next();
		}

		this._dynamicRouter(req, res, next);

		trace(req.fullUrl() + " : " + res.headersSent);
	}

	middlewareErrors(err, req, res, next) {
		trace(err);
		res.status(404).send();
	}
	
	middlewareFromMemory(req, res, next) {
		const localURI = $$$.paths.public + req.url.before('?');
		if(!req.url.has('.') || !$$$.memFS.existsSync(localURI)) {
			return next();
		}

		res.contentType(mime.lookup(localURI));
		return res.send($$$.memFS.readFileSync(localURI));
	};
};


//Extend all 'express' Request (req) objects with a .fullUrl() method.
express.request.fullUrl = function() {
	return url.format({
		protocol: this.protocol,
		host: this.get('host'),
		pathname: this.originalUrl
	});
};