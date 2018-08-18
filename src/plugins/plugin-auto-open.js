/**
 * Created by Chamberlain on 8/15/2018.
 */

const opn = require('opn');

const cfgAutoOpen = $$$.config.autoOpen || {};

module.exports = class PluginAutoOpen {
	init() {

	}

	configure() {
		if(!cfgAutoOpen.enabled) return;
		if(!cfgAutoOpen.delay) cfgAutoOpen.delay = 3000;
		const _this = this;

		_this._lastChecked = 0;

		$$$.plugins.Web.addRoutes({
			'/auto-open-check'(req, res, next) {
				_this._lastChecked = new Date().getTime();
				res.send('ok');
			}
		})
	}

	addEvents() {

	}

	start() {
		var counter = cfgAutoOpen.count;
		_.repeatUntil(1000, stop => {
			var now = new Date().getTime();
			var diff = now - this._lastChecked;

			if(diff<cfgAutoOpen.delay) {
				trace("-OK-".bgGreen + " Browser Already opened! :)");
				return stop();
			}

			if(counter>0) {
				return trace(`Auto opening in ${counter--} seconds...`);
			}

			stop();

			opn('http://localhost:' + $$$.config.web.port);
		})
	}
}