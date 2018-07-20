/**
 * Created by Chamberlain on 2/2/2018.
 */
const opn = require('opn');
const moment = require('moment');
const MAX_TIME_TO_OPEN = 2800;
let lastChecked = moment();

function SELF(config) {
	SELF.url = 'http://localhost:' + config.web.port;

	$$$.web.app.get('/auto-open-check', (req, res, next) => {
		lastChecked = moment();
		res.send({ok:1});
	});

	if(config.autoOpen===false) return;

	setTimeout(SELF.checkIfNeedsToOpen, MAX_TIME_TO_OPEN);
}

SELF.checkIfNeedsToOpen = function() {
	const ms = moment().diff(lastChecked, 'milliseconds');
	if(ms < MAX_TIME_TO_OPEN) return $$$.io.emit('auto-open-already');
	trace(`Opening project in browser (ms: ${ms})...`.cyan);
	opn(SELF.url);
}

module.exports = SELF;