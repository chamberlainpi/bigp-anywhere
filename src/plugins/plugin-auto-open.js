/**
 * Created by Chamberlain on 8/15/2018.
 */

module.exports = class PluginAutoOpen {
	init() {

	}

	configure(config) {
		//trace(config);
	}

	addEvents() {
		trace("AutoOpen delay DONE! "); // + (end - start) + "ms");

		// const start = new Date().getTime();
		//
		// return _.delayPromise(1000)
		// 	.then(() => {
		// 		trace(' ... ');
		// 		return _.delayPromise(1000);
		// 	})
		// 	.then(() => {
		// 		const end = new Date().getTime();
		//
		//
		// 	});
	}
}