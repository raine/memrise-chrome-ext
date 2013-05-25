(function() {
	'use strict';

	var ROOT_PREFIX = 'ls.';

	var LocalStore = window.LocalStore = function(prefix, defaults) {
		this.prefix   = ROOT_PREFIX + prefix + '.';
		this.defaults = defaults;
	};

	LocalStore.prototype.writeObj = function(obj) {
		for (var key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				this.set(key, obj[key]);
			}
		}
	};

	LocalStore.prototype.read = function() {
		var values = {};

		for (var i = (localStorage.length - 1); i >= 0; i--) {
			if (localStorage.key(i).indexOf(this.prefix) === 0) {
				var key = localStorage.key(i).substring(this.prefix.length);
				var value = this.get(key);
				if (value !== undefined) {
					values[key] = value;
				}
			}
		}

		return values;
	};

	LocalStore.prototype.set = function(key, value) {
		try {
			value = JSON.stringify(value);
		} catch (e) {
			value = null;
		}

		localStorage.setItem(this.prefix + key, value);
	};

	LocalStore.prototype.get = function(key) {
		var value = localStorage[this.prefix + key];
		if (value === null || value === undefined) {
			return this.defaults[key] || undefined;
		}
		try { return JSON.parse(value); } catch (e) { return null; }
	};

	LocalStore.prototype.clear = function() {
		for (var i = (localStorage.length - 1); i >= 0; i--) {
			if (localStorage.key(i).substring(0, this.prefix.length) === this.prefix) {
				localStorage.removeItem(localStorage.key(i));
			}
		}
	};
}());
