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
		}
	});

	function _css(styles, iterator) {
		const css = [];

		_.forIn(styles, (value, key) => css.push(iterator(value, key)));

		return css.join('; ');
	}

	$$$.css = function(styles) {
		return _css(styles, (value, key) => key + ': ' + value);
	};

	$$$.css.vars = function(vars) {
		return _css(vars, (value, key) => '--' + key + ': ' + value);
	};

	$$$.send = function(obj) {
		if(_.isString(obj)) obj = {url: obj};

		$$$.emit('load-start', obj.url);

		return new Promise((_then, _catch) => {
			obj = _.merge({
				type: 'POST',
				data: {sending: 1},
				contentType: "application/json",
				dataType: 'json',
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
})();
