
const routes = [];
const lookups = {};

export default function SELF(config) {
	Vue.use(VueRouter);
	Vue.config.devtools = true;

	$$$.components = {};

	const optionalParams = '/:brand?/:campaign?/:ad?';
	const pageProps = {
		brand: {type:String},
		campaign: {type:String},
		ad: {type:String},
	};

	_.forOwn(config.pages, (page, name) => {
		const shortName = name.split('-').pop();
		const path = '/' + shortName + optionalParams;
		if(shortName==='home') {
			$$$.loadVuePage('/', page);
			$$$.loadVuePage('/home', page);
		} else {
			$$$.loadVuePage(path, page, pageProps);
		}
	});

	_.forOwn(config.ui, (ui, name) => $$$.loadVueComp(name, ui));
	_.forOwn(config.panels, (ui, name) => $$$.loadVueComp(name, ui));
	_.forOwn(config.menus, (ui, name) => $$$.loadVueComp(name, ui));

	routes.push({path: '/home/*', redirect: '/home'});

	//Here's some Vue extensions (to quickly get to some common areas throughout the app).
	_.classy(Vue.prototype, {
		$app() { return this.$root.$children[0]; },
		$global() { return window; },
	});

	Vue.prototype.$lookup = function(tag, assign) {
		if(assign) lookups[tag] = assign;
		if(assign===false) lookups[tag] = null;

		return lookups[tag];
	};

	registerDirectives({
		'forward-events': {
			inserted(el, binding, vnode) {
				const listeners = vnode.context.$listeners;
				_.forOwn(listeners, (cb, event) => {
					el.addEventListener(event, cb);
				})
			}
		},
		'open-panel': {
			inserted(el, binding, vnode) {
				const valueArr = binding.value.split(',');
				const panelName = valueArr[0];
				const cb = (e) => $$$.panelManager.push(panelName);

				el.addEventListener('mousedown', cb);

				const methodName = valueArr.length>1 ? valueArr[1] : panelName;

				if(vnode.context[methodName]) {
					traceError(`Warning! You are overwriting an existing method with a [${binding.rawName}="${binding.expression}"] directive!`);
				}

				//Create a method with the same name as the panel
				vnode.context[methodName] = cb;
			}
		}
	});

	registerComponents({
		'outer': { template: `<div class="inner"><slot></slot></div>` },
	});

	return new Vue({
		el: '#app',
		router: new VueRouter({routes: routes}),
		template: '<App/>',
		components: {App: config.app},
	});
}

function registerComponents(comps) {
	_.forOwn(comps, (comp, compName) => {
		if(!comp.noDiv) {
			comp.template = `<div class="${compName}">${comp.template}</div>`;
		}

		$$$.loadVueComp(compName, comp);
	});
}

function registerDirectives(directives) {
	_.forOwn(directives, (dir, dirName) => {
		Vue.directive(dirName, dir);
	})
}

$$$.loadVueComp = function(name, compVue) {
	var comp = Vue.extend(compVue);
	$$$.components[name] = comp;
	Vue.component(name, comp);
};

$$$.loadVuePage = function(pagePath, pageVue, pageProps) {
	const watchers = _.remap(pageVue.props, (key, value) => {
		return {
			key: '$route.params.' + key,
			value(value) {
				trace(key + " changed to: " +  value);
				//this.refreshPage();
			}
		}
	});

	pageVue.watch = _.extend(watchers, pageVue.watch);
	pageVue.props = _.extend(pageProps, pageVue.props);

	const pageName = pagePath.split('/')[1] || 'home';
	const pageComp = Vue.extend(pageVue);

	routes.push({
		path: pagePath,
		name: pageName,
		props: true,
		component: pageComp
	});
};

_.classy($$$.panelManager = {}, {
	$panels() { return $$$.vue.$app.panels; },
	push(name, options) {
		if(!name.startsWith('panel-')) name = 'panel-' + name;
		const panelData = _.extend(options, {name: name});

		this.$panels.push(panelData);

		return panelData;
	},
	pop() {
		return this.$panels.pop();
	},
	remove(name) {
		if(!name.startsWith('panel-')) name = 'panel-' + name;

		const found = this.$panels.find(p => p.name===name);
		if(!found) return traceError("Could not remove panel: " + name);

		this.$panels.remove(found);

		return found;
	}
});