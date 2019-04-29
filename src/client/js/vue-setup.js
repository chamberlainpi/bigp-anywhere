const EVENTS = require( '../../server/constants' ).EVENTS;

const VueSetup = {
	_components: {},

	init( config ) {
		if ( !config ) throw 'Missing Vue config object!';
		if(!config.app) throw 'Missing Vue <App /> definition! Please provide a config.app parameter!';

		Vue.use(VueRouter);
	 	Vue.config.devtools = true;

		config.components && _.forOwn(config.components, VueSetup.registerComponentByName);

		//Here's some Vue extensions (to quickly get to some common areas throughout the app).
		_.classy(Vue.prototype, {
			$app() { return this.$root.$children[0]; },
			$global() { return window; },
		}, config.getters);

		_.extend(Vue.prototype, {
			$gotoRoute(to, params) {
				this.$router.push({name: to, params: params});
			}
		});

		VueSetup.registerDirectives({
			'forward-events': {
				inserted(el, binding, vnode) {
					const listeners = vnode.context.$listeners;
					_.forOwn(listeners, (cb, event) => {
						el.addEventListener(event, cb);
					})
				}
			},
			'view': {
				inserted(el, binding, vnode) {
					trace(el);
					$$$.on( EVENTS.ROUTE_CHANGED, (to, from) => {
						trace(to.path);
					});

					trace(vnode);
				}
			}
		}, config.directives);

		Vue.mixin({
			mounted: function() {
				const name = this.$options._componentTag;
				if(!name || !this.$el || !this.$el.classList) return;
				this.$el.classList.add(name.toLowerCase());
			}
		});

		return new Vue({
			el: '#app',
			router: new VueRouter({routes: config.routes}),
			template: '<App/>',
			components: {App: config.app},
			watch: {
				'$route'(to, from) {
					$$$.emit( EVENTS.ROUTE_CHANGED, to, from);
				}
			}
		});
	},

	registerComponentByName( compVue, name ) {
		var comp = Vue.extend(compVue);
		VueSetup._components[name] = comp;
		Vue.component(name, comp);
	},

	registerComponents(comps) {
		_.forOwn(comps, (comp, compName) => {
			if(!comp.noDiv) {
				comp.template = `<div class="${compName}">${comp.template}</div>`;
			}

			VueSetup.registerComponentByName(comp, compName);
		});
	},

	registerDirectives(... directivesArr) {
		directivesArr.forEach(directives => {
			if(!directives) return;

			_.forOwn(directives, (dir, dirName) => {
				Vue.directive(dirName, dir);
			})
		});
	},
};

export default VueSetup;