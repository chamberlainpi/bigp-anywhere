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
const EVENTS = require( '../server/constants' ).EVENTS;
const obj2routes = require( '../server/sv-obj-2-routes' );
const app = $$$.app = express();
const server = $$$.server = http.createServer(app);
const omitLogs = ['favicon'];

let config;

module.exports = class PluginWeb {
	init() {
		this._dynamicRouter = null;
		this._dynamicObject = {};
		this._isRoutesDirty = false;
		this._isStarted = false;

		config = _.result( $$$.config, 'web' );
		
		if ( !config.port ) config.port = 3333;
	}

	configure() {
		$$$.memFS.writeFileSync( "/test.txt", 'Test file.', 'utf8' );
		$$$.memFS.writeFileSync( "/favicon.ico", '', 'utf8' );
		
		app.use( ( req, res, next ) => {
			res.on( 'finish', () => {
				if ( $$$.env.test ) return; //Omit status logs while TESTING the module
				
				var codeStr = String( res.statusCode );
				codeStr = codeStr[res.statusCode < 400 ? 'green' : 'red'];
				var output = [req.method.green, codeStr, req.fullUrl().green, res.message].join( ' ' );

				if ( output.has.apply( output, omitLogs ) ) return;
				trace( output );
			} );
			
			next();
		})
		
		//Test for (intentional) crashes:
		app.use( '/crash', ( req, res, next ) => {
			throw 'Intentional Request Crash!';
		} );

		app.use( '/test', ( req, res, next ) => {
			res.send('Testing!');
		} );

		app.use( this.middlewareDynamic.bind( this ) );
		app.use( ( req, res, next ) => this.middlewareErrors( 'File not found', req, res, next ) );
		app.use( this.middlewareErrors.bind( this ) );
		
		$$$.plugins.forEach( 'routes', routes => this.addRoutes( routes ) );

		this.addRoutes( config.routes );
	}

	start() {
		if ( this._isStarted ) return trace( "Already started!".red );

		this._isStarted = true;

		this.localhost = 'http://localhost:' + config.port;
		return new Promise( _then => {
			server.listen( config.port, () => {
				trace( "  *STARTED*  ".bgGreen + ' ' + this.localhost );
				$$$.emit( EVENTS.SERVER_READY );
				_then();
			} );
		})
	}

	//////////////////////////////////////////////////////////////

	addRoutes( obj ) {
		if ( !obj ) return null;

		_.extend(this._dynamicObject, obj);

		this.dirtyRoutes();

		return obj;
	}

	dirtyRoutes() {
		if(this._isRoutesDirty) return;

		this._isRoutesDirty = true;

		process.nextTick( () => this._dirtyRouteCycle());
	}

	_dirtyRouteCycle() {
		this._isRoutesDirty = false;

		if ( !this._dynamicObject ) {
			this._dynamicRouter = null;
			return;
		}

		this._dynamicRouter = obj2routes( this._dynamicObject, {
			app: app,
			express: express,
			memoryMiddleware: this.middlewareFromMemory.bind( this )
		} );
	}

	clearRoutes() {
		this._dynamicObject = {};
		this._dynamicRouter = null;
	}

	middlewareDynamic( req, res, next ) {
		if ( !this._dynamicRouter ) {
			traceOnce( req.url, 'No dynamic router available!' );
			return next('No dynamic router available!');
		}
		
		this._dynamicRouter( req, res, next );
	}

	middlewareErrors( err, req, res, next ) {
		res.message = err;

		const send404 = data => res.status( 404 ).send( data );

		// Check if it has a file-extension, then it's probably just a missing file resource (not HTML).
		var file = req.url.split( '/' ).pop();
		if ( file.has( '.' ) && !file.has('.htm') ) {
			return send404(' ');
		}

		//Otherwise, show a '404' HTML page with the error in question.
		var tmp404 = [
			$$$.paths.templates,
			$$$.paths._bpa.templates
		].map( p => p + '/404.html' );

		var replacements = {
			ERROR_TITLE: '404 Request Error',
			ERROR_MESSAGE: err,
			REQUEST_URL: req.fullUrl()
		};

		$$$.readFirstAvailable( tmp404 )
			.then( content => content.replaceBrackets( replacements ) )
			.then( send404 );
	}
	
	middlewareFromMemory( req, res, next ) {
		var url = req.url.before( '?' );
		var localURI = $$$.paths.public + url;
		var exists = [url, localURI].filter( p => $$$.memFS.existsSync( p ) );

		//If the url doesn't have a file-extension -or- doesn't exists in the memory-fs, then skip:
		if ( !url.has( '.' ) || !exists.length ) return next();

		url = exists[0];
		res.message = '*MEMORY*'.yellow;
		res.contentType( mime.lookup( url ) );
		return res.send( $$$.memFS.readFileSync( url ));
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