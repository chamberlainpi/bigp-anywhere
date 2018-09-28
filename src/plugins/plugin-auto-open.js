/**
 * Created by Chamberlain on 8/15/2018.
 */

const opn = require('opn');

const cfgAutoOpen = $$$.config.autoOpen || {};

module.exports = class PluginAutoOpen {
	init() {
		const _this = this;

		this.routes = {
			'/auto-open-check'(req, res, next) {
				_this._lastChecked = new Date().getTime();
				res.send('ok');
			}
		}
	}

	configure() {}
	addEvents() {}

	start() {
		if(!cfgAutoOpen.enabled) return trace("AUTO-OPEN disabled".bgRed);
		if(!cfgAutoOpen.delay) cfgAutoOpen.delay = 3000;

		this._lastChecked = 0;

		let counter = cfgAutoOpen.count;
		_.repeatUntil(1000, stop => {
			const now = new Date().getTime();
			const diff = now - this._lastChecked;

			if(diff<cfgAutoOpen.delay) {
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