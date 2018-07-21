/**
 * Created by Chamberlain on 7/6/2018.
 */

const fs = require('fs-extra');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();

_.extend($$$, {
	promptFile(params) {
		if(_.isString(params)) params = {path: params};
		else params = params || {};

		let path = params.path || './';
		let ext = params.ext || '.js';
		let includePrivate = params.includePrivate===true;
		path = path.mustEndWith('/');

		return new Promise((_then, _catch) => {
			fs.readdir(path)
				.then(dirs => dirs
					.filter(d => (!includePrivate && !d.startsWith('_')) && d.endsWith(ext))
					.map(d => path + d))
				.then(dirs => {
					const choices = dirs.map(d => d.remove(path));

					return prompt({
							type: 'list',
							name: 'value',
							message: params.message || 'Please select a file:',
							choices: choices,
							default: 0
						});
				})
				.then(choice => _then(path + choice.value))
				.catch(err => _catch(err));
		});
	}
});