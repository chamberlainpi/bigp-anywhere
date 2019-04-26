/**
 * Created by Chamberlain on 8/15/2018.
 */

const MFS = require( 'memory-fs' );
const yargs = require( 'yargs' );

module.exports = class PluginCommander {
	// init() { }  configure() { }  addEvents() { }

	preinit() {
		$$$.memFS = new MFS();

		$$$.env = yargs
			.option( 'prod', { alias: 'p', describe: 'Set as "production" environment' } )
			.option( 'verbose', { alias: 'v', describe: 'Log more details in the console.' } )
			.option( 'command', { alias: 'c', describe: 'Run some utility commands (built-in OR customs).' } )
			.option( 'help', { alias: 'h', describe: 'Provide some help' } )
			.option( 'test', { alias: 't', describe: 'Run the mocha/chai test cases.' } )
			.option( 'what', { alias: '?', describe: 'Provide more details on a specific command' } )
			.argv;
		
		const isProd = $$$.env.p === true;

		_.extend( $$$.env, {
			isProd: isProd,
			isDev: !isProd,
			name: isProd ? 'prod' : 'dev'
		} );

		if ( this.isUsingCommand( $$$.env ) ) throw 'skip';
	}

	isUsingCommand( env ) {
		if ( !env.c ) return false;

		if ( !_.isString( env.c ) ) {
			this.promptAllAvailableCommands();
			return true; //trace.FAIL( 'Command must be provided. EMPTY found.'.red );
		}

		const commandFile = $$$.paths._bpa.commands + env.c.mustWrapWith( '/', '.js' );
		if ( !$$$.fs.existsSync( commandFile ) ) {
			trace.FAIL( 'Command file does not exists: \n'.red + commandFile );
			return true;
		}

		const cmd = require( commandFile );

		if ( env.what ) {
			if ( !cmd.help ) return trace( "No help documention found for command: " + env.c );

			const title = `\n   How to use '${env.c}' command:  \n`;
			const sep = '-'.times( title.length - 2 );
			let tags = '';

			if ( cmd.tags ) {
				tags = cmd.tags.split( ',' ).map( a => a.trim().toUpperCase() );
				tags = `\n  TAGS: [${tags.join( ', ' )}]\n`.gray;
			}

			trace( ( sep + title + sep ).bgGreen + '\n' + tags + '\n' + cmd.help.trim().yellow );

			
		} else if ( _.isFunction( cmd.exec ) ) {
			trace( "Executing command: ".green + env.c )
			cmd.exec();
		}

		return true;
	}

	promptAllAvailableCommands() {
		var commandPaths = [$$$.paths._bpa.commands, $$$.paths.commands];

		$$$.filterFiles( commandPaths, '.js' )  //  <-----------------------------------
			.then( commandFiles => {
				trace( "Here are the commands:" );
				trace( commandFiles );
		})
	}
}