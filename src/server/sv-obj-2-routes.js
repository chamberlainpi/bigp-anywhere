/**
 * Created by Chamberlain on 8/16/2018.
 */

const fs = require('fs-extra');

const DEBUG = o => !$$$.env.test && trace(o);

module.exports = function obj2routes(routesObj, options) {
	const app = options.app;
	const express = options.express;

	function _recursive(obj) {
		const router = express.Router({strict:false});

		_.forOwn(obj, (value, key) => {
			if(!_.isArray(value)) value = [value];

			value.forEach(middleware => _eachMiddleware(router, key, middleware));
		});

		return router;
	}

	function _eachMiddleware(router, key, obj) {
		const routeArr = key.split('::', 2);
		const method = routeArr.length===1 ? 'get' : routeArr[0].toLowerCase();
		const subPath = routeArr.length===1 ? routeArr[0] : routeArr[1];
		const sendfile = (req, res, next) => res.sendFile(obj);
		const senddata = ( req, res, next ) => res.send( obj );
		
		const DEBUG_HEADER = `\u251C app.${method}("${subPath}"): `.padEnd(32);
		
		function _routeDebug(log, cb, what) {
			DEBUG(DEBUG_HEADER + log.bgCyan.black + ' ' + (what || ''));
			return router[method](subPath, cb);
		}

		if(_.isString(obj)) {
			if(obj.toUpperCase()==='*MEMORY*') {
				if(!options.memoryMiddleware) throw 'Missing options.memoryMiddleware!';

				return _routeDebug("MEMORY", options.memoryMiddleware);
			} else if(key.has('.')) {
				return _routeDebug("DIRECT FILE", sendfile);
			} else if ( obj.split( '/' ).length > 2 ) {
				var missing = '';
				if ( !fs.existsSync( obj ) ) {
					missing = " (Missing directory)".red; //Cannot serve 
				}

				return _routeDebug( "STATIC DIR", express.static( obj ), obj + missing );
			} else {
				return _routeDebug("STRING DATA", senddata, obj);
			}
		}

		if(_.isFunction(obj)) {
			DEBUG(DEBUG_HEADER + "MIDDLEWARE".bgCyan.black);

			if(obj.length===0) {
				//Must be some sort of special chained route:
				const routeChains = obj();
				trace("ROUTE CHAINS... " + routeChains.length);

				router[method].apply(router, [subPath].concat(routeChains));
			} else {
				router[method](subPath, obj);
			}
		} else {
			DEBUG(DEBUG_HEADER + "CHILD...".bgCyan.black);
			const childRouter = _recursive(obj);
			
			router.use(subPath, childRouter);
		}
	}

	return _recursive(routesObj);
}