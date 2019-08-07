const EVENTS = require( '~constants' ).EVENTS;
import PortalVue from 'portal-vue/dist/portal-vue.esm';
import BootstrapVue from 'bootstrap-vue';

let options;

const VueSetup = {
	_components: {},

	init( opts ) {
		if ( !opts ) throw 'Missing Vue config object!';
		if ( !opts.app ) throw 'Missing Vue <App /> definition! Please provide a config.app parameter!';

		Vue.config.devtools = true;

		options = opts;

		Vue.use( VueRouter );
		Vue.use( PortalVue );
		Vue.use( BootstrapVue );

		opts.components = _.castArray( opts.components );

		if ( opts.components ) {
			opts.components.forEach( compKit => {
				_.forOwn( compKit, VueSetup.registerComponentByName );
			} );

			trace( '---VUE COMPONENTS---', VueSetup._components );
		}

		//Here's some Vue extensions (to quickly get to some common areas throughout the app).
		_.classy(Vue.prototype, {
			$app() { return this.$root.$children[0]; },
			$global() { return window; },
			$_() { return _; },
		}, opts.getters);

		_.extend(Vue.prototype, {
			$gotoRoute(to, params) {
				this.$router.push({name: to, params: params});
			},
			$loopWhileMounted( cb ) {
				const _this = this;

				if ( !_this._loops ) {
					const loops = _this._loops = {
						callbacks: [],
						raf() {
							loops.callbacks.forEach( cb => cb() );

							if ( loops.isDestroyed ) return;

							requestAnimationFrame( loops.raf );
						}
					};

					_this.$once( 'hook:beforeDestroy', () => {
						loops.isDestroyed = true;
					} );

					loops.raf();
				}

				this._loops.callbacks.push( cb );
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
		}, opts.directives);

		Vue.mixin({
			mounted() {
				reapplyComponentClassname( this );
			},

			updated() {
				reapplyComponentClassname( this );
			}
		} );
		
		function reapplyComponentClassname(_this) {
			const name = _this.$options._componentTag;
			
			if ( !name || !_this.$el || !_this.$el.classList ) return;

			_this.$el.classList.add( name.toLowerCase() );
		}

		return new Vue({
			el: '#app',
			router: new VueRouter({routes: opts.routes}),
			template: '<App/>',
			store: opts.store,
			components: {App: opts.app},
			watch: {
				'$route'(to, from) {
					$$$.emit( EVENTS.ROUTE_CHANGED, to, from);
				}
			}
		});
	},

	registerComponentByName( compVue, name ) {
		if ( !compVue || !name ) return;
		
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
	}
};

function initVuex() {
	if ( !window.Vuex ) return;

	const strToArr = (mappingFunc, propToGetKeys) => value => {
		//Default:
		if ( !_.isString( value ) ) return mappingFunc( value );

		if ( value === '*' ) {
			if ( !$$$.store ) {
				return trace.FAIL( "Missing '$$$.store', cannot assume a default Vuex store to obtain all * keys!" );
			}

			if ( propToGetKeys === "state" ) return trace.FAIL( 'Should NOT use the mapState directly, try using getters instead.' );

			const storeProp = $$$.store[propToGetKeys];

			return mappingFunc( _.keys( storeProp ) );
		}

		//Otherwise, split it!
		return mappingFunc( value.split( ' ' ) );
	}

	Vuex.mapActions = strToArr( Vuex.mapActions, '_actions' );
	Vuex.mapGetters = strToArr( Vuex.mapGetters, 'getters' );
	Vuex.mapState = strToArr( Vuex.mapState, 'state' );
	Vuex.mapMutations = strToArr( Vuex.mapMutations, '_mutations' );
}

initVuex();

export default VueSetup;