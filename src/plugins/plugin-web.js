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

module.exports = class PluginWeb {
	init() {

	}

	configure() {

	}

	addEvents() {

	}
}