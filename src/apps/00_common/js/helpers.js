/**
 * Created by Chamberlain on 4/6/2018.
 */

(function() {
	_.extend(EventEmitter.prototype, {
		onLater(name, framesOrMS, cb) {
			if(framesOrMS<0) {
				framesOrMS = -framesOrMS;
				return this.on(name, () => _.deferFrames(framesOrMS, cb))
			}

			this.on(name, () => {
				setTimeout(cb, framesOrMS);
			});
		}
	});

	_.extend(jQuery.fn, {
		forEach(cb) {
			this.each((e, el) => cb( $(el) ));
		},
		center() {
			const $window = $(window);
			this.css("position","absolute");
			this.css("top", ( $window.height() - this.height() ) / 2 + $window.scrollTop() + "px");
			this.css("left", ( $window.width() - this.width() ) / 2 + $window.scrollLeft() + "px");
			return this;
		},

		setClassIf(clazz, isTrue) {
			if(isTrue) this.addClass(clazz);
			else this.removeClass(clazz);

			return this;
		},

		findAndRemove(clazz) {
			this.find(clazz).removeClass(clazz);

			return this;
		},

		addEvents( eventTree ) {
			const _this = this;
			const eventObj = _.getOrCreate( this, '_eventObj', {} );
			const makeListener = ( type, obj ) => {
				//For keyboard events...
				if ( type.startsWith( 'key' ) ) {
					return function ( e ) {
						const keyname = (e.key || 'null').toLowerCase();

						// Check each of the listener-handlers to see if
						// their any of their params matches the keyboard key-name pressed.
						obj.handlers.forEach( h => {
							if ( !h.params.has( keyname ) ) return;
							h.cb( e );
						} );
					}
				}

				return function ( e ) {
					obj.handlers.forEach( h => h.cb(e) );
				}
			}

			_.forOwn( eventTree, ( cb, key ) => {
				key = key.replace( '@', 'keydown:' );
				
				const keySplit = key.toLowerCase().split( ':' );
				const eventName = keySplit.shift();
				const params = keySplit.length > 0 ? keySplit.shift().split( ',' ) : [];
				
				const obj = _.getOrCreate( eventObj, eventName, {
					handlers: [],
					listener: null,
				} );

				if ( !obj.listener ) {
					obj.listener = makeListener( eventName, obj );

					_this.on( eventName, obj.listener );
				}

				obj.handlers.push( {
					params: params,
					cb: cb
				} );
			})
		}
	});

	function _cssString(styles, iterator) {
		const css = [];

		_.forIn(styles, (value, key) => css.push(iterator(value, key)));

		return css.join('; ');
	}

	$$$.css = function(styles) {
		return _cssString(styles, (value, key) => key + ': ' + value);
	};

	$$$.css.vars = function(vars) {
		return _cssString(vars, (value, key) => '--' + key + ': ' + value);
	};

	$$$.send = function(obj) {
		if(_.isString(obj)) obj = {url: obj};

		$$$.emit('load-start', obj.url);

		return new Promise((_then, _catch) => {
			obj = _.merge({
				type: 'POST',
				data: {sending: 1},
				contentType: "text/json",
				success(ok) {
					$$$.emit('load-end', obj.url);

					_then(ok);
				},
				error(err) {
					$$$.emit('load-end', obj.url);

					_catch(err);
				}
			}, obj);

			$.ajax(obj);
		})
	};

	$$$.api = function ( url, postData ) {
		let obj = { url: url };

		$$$.emit( 'load-start', obj.url );
		
		return new Promise( ( _then, _catch ) => {
			obj = _.merge( {
				type: postData ? 'POST' : 'GET',
				success( ok ) {
					$$$.emit( 'load-end', obj.url );

					_then( ok );
				},
				error( err ) {
					$$$.emit( 'load-end', obj.url );
					
					_catch( err );
				}
			}, obj );

			postData ? $.post( obj, postData ) : $.ajax( obj );
		} )
	}
})();
