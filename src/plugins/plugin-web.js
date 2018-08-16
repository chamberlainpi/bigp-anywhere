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
const app = $$$.app = express();
const server = $$$.server = http.createServer(app);

const config = $$$.config.web;

module.exports = class PluginWeb {
	init() {
		this._dynamicRouter = null;
	}

	configure(config) {
		app.use('/', express.static($$$.paths.public));
		app.use('/', express.static($$$.paths._bpa.public));
		app.use('/', this.dynamicMiddleware.bind(this));
		app.use(this.errorMiddleware);
	}

	addEvents() {
		const port = config.port || 3333;

		server.listen(port, () => {
			trace("  *STARTED*  ".bgGreen + ' http://localhost:' + port);
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
};

/*
	'/'

	'/api'

	'/js'
 */