/**
 * Created by Chamberlain on 8/15/2018.
 */
const fs = require('fs-extra');

class CommandProxy {
	constructor(extras) {
		const priv = this._private = {
			isTicking: false,
			queue: [],
			self: {},
			onDone: null,
			extras: extras || {}
		};

		return new Proxy(this, {
			get(target, prop) {
				if((typeof prop) === 'symbol') {
					return priv.self;
				}

				const exists = target[prop];
				const queue = priv.queue;
				const extras = priv.extras;
				const _prop = '_' + prop;
				const method = extras && prop in extras ? extras[prop] : target[_prop];

				if(exists && (prop.startsWith('_') || !_.isFunction(exists))) return exists;

				return function _proxyResolveMethod(... args) {
					if(!method) {
						const err = `Cannot call "${prop}" because it isn't defined on: `;
						traceError(err.red + target.constructor.name);
					} else {
						queue.push({cb:method, target:this, args:args});
					}

					this._prepare();

					return this;
				};
			}
		});
	}

	_done(cb) {
		this._private.onDone = cb;
	}

	_prepare() {
		const _this = this;
		const priv = this._private;

		if(priv.isTicking) return;
		priv.isTicking = true;

		process.nextTick(function _proxyNextTick() {
			priv.isTicking = false;

			_this._process();
		});
	}

	_process() {
		const priv = this._private;
		const queue = priv.queue;

		//Clear the queue until next time:
		priv.queue = [];

		function next() {
			if(!queue.length) {
				const done = priv.onDone;
				priv.onDone = null;
				return done && done();
			}

			const current = queue.shift();
			const result = current.cb.apply(current.target, current.args);

			if(result instanceof Error) {
				traceError(result.toString().red);
			}

			Promise.resolve(result).then(next);
		}

		next();
	}
}

module.exports = class PluginManager extends CommandProxy {

	static create() {
		return new PluginManager();
	}

	constructor() {
		let sup = super();
		this._modules = [];
		this.isSilent = false;

		return sup;
	}

	_loadFromPath(path) {
		const _this = this;

		if(!fs.existsSync(path)) {
			return new Error('Cannot add non-existant plugins directory: ' + path);
		}

		return $$$
			.requireDir(path, {filter: 'plugin*'})
			.then(modules => {
				//trace("Plugins loaded from: ".yellow + path);
				modules.forEach( plugin => {
					const inst = new plugin();
					inst.name = plugin.name.remove('Plugin');

					_this._modules.push(inst);
					_this[inst.name] = inst;

				});
			})
	}

	_callEach(method, ... args) {
		//trace("Calling method: ".yellow + method);
		const failed = [];

		_.forOwn(this._modules, (plugin, key) => {
			const func = plugin[method];
			if(!func || key.startsWith('$') || key.startsWith('_')) {
				return failed.push(plugin.name);
			}

			func.apply(plugin, args);
		});

		if(failed.length && !this.isSilent) {
			trace(`Failed calling "${method}" on:\n`.red + failed.toPrettyList())
		}
	}
}

