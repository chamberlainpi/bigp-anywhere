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
const app = express();
const server = http.createServer(app);

const config = $$$.config.web;

module.exports = class PluginWeb {
	init() {
		trace("WEB INIT");

		this._dynamicRoutes = [];
	}

	configure(config) {

		app.use('/', express.static($$$.paths.public));

		app.use('/', this.dynamicMiddleware.bind(this));
	}

	addEvents() {
		const port = config.port || 3333;

		server.listen(port, () => {
			trace("  *STARTED*  ".bgGreen + ' http://localhost:' + port);
		})

		this.addRoutes((req, res, next) => {
			trace("This is a dynamic route! #1");
			res.send('hello world 1');
		});

		this.addRoutes((req, res, next) => {
			trace("This is a dynamic route! #2");
			res.send('hello world 2');
		})
	}

	///////////////////////////////

	dynamicMiddleware(req, res, next) {
		let i = 0;
		const routes = this._dynamicRoutes;

		do {
			const route = routes[i++];
			const result = route(req, res, function _dynamicMiddlewareErrorHandler(err) {
				if(err) {
					i = -1;
					trace('Error in dynamic middleware: \n'.red + err);
					return next(err);
				}
			});

			trace(result);

		} while(i > -1 && i < routes.length);
	}

	addRoutes(func) {
		this._dynamicRoutes.push(func);
	}
}



/*
	'/'

	'/api'

	'/js'
 */