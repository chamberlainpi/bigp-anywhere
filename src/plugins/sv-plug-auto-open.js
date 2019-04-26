/**
 * Created by Chamberlain on 8/15/2018.
 */

const opn = require('opn');

let cfg;

module.exports = class PluginAutoOpen {
	configure() { }
	addEvents() { }
	
	init() {
		const _this = this;

		cfg = $$$.config.autoOpen || {};

		this.routes = {
			'/auto-open-check'(req, res, next) {
				_this._lastChecked = new Date().getTime();
				res.send('ok');
			}
		}
	}

	start() {
		if(!cfg.enabled) return trace("AUTO-OPEN disabled".bgYellow);
		if(!cfg.delay) cfg.delay = 3000;

		this._lastChecked = 0;

		let counter = cfg.count;
		_.repeatUntil(1000, stop => {
			const now = new Date().getTime();
			const diff = now - this._lastChecked;

			if(diff<cfg.delay) {
				trace("-OK-".bgGreen + " Browser Already opened! :)");
				return stop();
			}

			if(counter>0) {
				return trace(`Auto opening in ${counter--} seconds...`);
			}

			stop();

			this.openURL();
		})
	}

	openURL() {
		opn('http://localhost:' + $$$.config.web.port);
	}
}