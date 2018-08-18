/**
 * Created by Chamberlain on 8/16/2018.
 */

const fs = require('fs-extra');

const DEBUG = o => false && trace(o);

module.exports = function obj2routes(routesObj, options) {
	const app = options.app;
	const express = options.express;

	function _recursive(obj) {
		const router = express.Router();

		_.forOwn(obj, (value, key) => {
			if(!_.isArray(value)) value = [value];

			value.forEach(middleware => _eachMiddleware(router, key, middleware));
		});

		return router;
	}

	function _eachMiddleware(router, key, obj) {
		function _makeGetter(log, cb, what) {
			DEBUG(key + ": " + log + " " + (what || ''));
			return router.get(key, cb);
		}

		if(_.isString(obj)) {
			if(obj.toUpperCase()==='*MEMORY*') {
				if(!options.memoryMiddleware) throw 'Missing options.memoryMiddleware!';

				return _makeGetter("ROUTE FROM MEMORY", options.memoryMiddleware);
			} else if(key.has('.')) {
				return _makeGetter("ROUTE DIRECT FILE", (req, res, next) => res.sendFile(obj));
			} else if(obj.split('/').length>2) {
				if(!fs.existsSync(obj)) {
					return DEBUG("Cannot serve missing directory: ".red + obj);
				}

				return _makeGetter("ROUTE STATIC DIR", express.static(obj), obj);
			} else {
				return _makeGetter("ROUTE STRING", (req, res, next) => res.send(obj), obj);
			}
		}

		if(_.isFunction(obj)) {
			const routeArr = key.split('::', 1);
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
		} else {
			DEBUG("ROUTE CHILD: " + key);
			const childRouter = _recursive(obj);

			router.use(key, childRouter);
		}
	}

	return _recursive(routesObj);
}