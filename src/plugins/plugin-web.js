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
	}

	configure(config) {
		//app.use('/', express.static($$$.paths.public));
		//app.use('/', express.static($$$.paths._bpa.public));
		app.use('/', this.dynamicMiddleware.bind(this));
		app.use(this.errorMiddleware);

		this.addRoutes(config.web.routes);
	}

	addEvents() {

	}

	start() {
		server.listen(config.port, () => {
			trace("  *STARTED*  ".bgGreen + ' http://localhost:' + config.port);
		})
	}

	//////////////////////////////////////////////////////////////

	dynamicMiddleware(req, res, next) {
		if(!this._dynamicRouter) {
			traceOnce(req.url, 'No dynamic router available!');
			return next();
		}

		this._dynamicRouter(req, res, next);
	}

	errorMiddleware(err, req, res, next) {
		trace(err);
		res.status(404).send();
	}

	addRoutes(obj) {
		if(!obj) return;

		_.extend(this._dynamicObject, obj);

		this._dynamicRouter = obj2routes(this._dynamicObject, {
			app:app,
			express:express,
			memoryMiddleware: this.memoryMiddleware.bind(this)
		});
	}

	clearRoutes() {
		this._dynamicObject = {};
		this._dynamicRouter = null;
	}

	memoryMiddleware(req, res, next) {
		const localURI = $$$.paths.public + req.url.before('?');
		if(!req.url.has('.') || !$$$.memFS.existsSync(localURI)) {
			return next();
		}

		res.contentType(mime.lookup(localURI));
		return res.send($$$.memFS.readFileSync(localURI));
	};
};

/*
	'/'

	'/api'

	'/js'
 */