/**
 * Created by Chamberlain on 8/15/2018.
 */

const opn = require('opn');

let config;

module.exports = class PluginAutoOpen {
	init() {
		const _this = this;

		config = $$$.config.autoOpen || {};

		this.routes = {
			'/auto-open-check'(req, res, next) {
				_this._lastChecked = new Date().getTime();
				res.send('ok');
			}
		}
	}

	start() {
		if(!config.enabled) return trace("AUTO-OPEN disabled".bgYellow);
		if(!config.delay) config.delay = 3000;

		this._lastChecked = 0;

		let counter = config.count;
		_.repeatUntil(1000, stop => {
			const now = new Date().getTime();
			const diff = now - this._lastChecked;

			if(diff<config.delay) {
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
		opn( 'http://localhost:' + config.web.port);
	}
}