/**
 * Created by Chamberlain on 11/19/2018.
 */

module.exports = {
	isUsingCommand(env) {
		if(!env.c) return false;

		if(!_.isString(env.c)) {
			return trace.FAIL('Command must be provided. EMPTY found.'.red);
		}

		const commandFile = $$$.paths._bpa.commands + env.c.mustWrapWith('/', '.js');
		if(!$$$.fs.existsSync(commandFile)) {
			trace.FAIL('Command file does not exists: \n'.red + commandFile);
			return true;
		}

		const cmd = require(commandFile);

		if(env.what) {
			if(!cmd.help) return trace("No help documention found for command: " + env.c);
			
			const title = `   How to use '${env.c}' command:  \n`;
			const h = '-'.times(title.length-1) + '\n';
			return trace((h + title + h).bgGreen + '\n' + cmd.help.trim())
		} else if(_.isFunction(cmd.exec)) {
			trace("Executing command: ".green + env.c)
			cmd.exec();
			return true;
		}

		return true;
	}
}