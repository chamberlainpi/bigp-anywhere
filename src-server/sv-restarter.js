/**
 * Created by Chamberlain on 3/30/2018.
 */
const cluster = require('cluster');
const trace = console.log.bind(console);
var isStarted = false;

function SELF(config, cb) {
	SELF.config = config;
	if(cluster.isMaster) return SELF.doLoop();

	cb && cb();
}

SELF.doLoop = function() {
	if(isStarted) throw new Error('Already started a child-process!');
	isStarted = true;

	let persistent;

	function loop() {
		if(!persistent) {
			traceClear();
			persistent = cluster.fork();
			trace(`MASTER #${process.pid} Started child process PID #${persistent.process.pid}.`);
		}

		setTimeout(loop, 100);
	}

	cluster.on('exit', (worker, code, signal) => {
		trace(`Worker ${worker.process.pid} died (code ${code})`);

		if(code > 0 || (SELF.config && SELF.config.isSlowRefresh)) {
			setTimeout(() => persistent = null, 2000);
		}  else {
			persistent = null;
		}
	});

	loop();
}

module.exports = SELF;