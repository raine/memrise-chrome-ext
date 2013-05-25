var app = app || {};

// Tests use this, therefore outside
var OPTIONS_DEFAULTS = {
	'wilting-threshold': 1,
	'track-usage': true
};

(function() {
	var ROOT_PREFIX = 'ls.';

	var LocalStore = this.LocalStore = function(prefix) {
		this.prefix = ROOT_PREFIX + prefix + '.';
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
		if (value === null) { return undefined; }
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

(function() {
	'use strict';

	app.Settings = Backbone.Model.extend({
		defaults: OPTIONS_DEFAULTS,

		initialize: function() {
			this.ls = new LocalStore('settings');

			this.on('change', function(model) {
				model.save(); // Triggers sync with 'create'
			});

			this.fetch(); // Read values from localStorage
		},

		sync: function(method, model, options) {
			console.log('Settings: sync', method, model, JSON.stringify(model.attributes));

			switch(method) {
				case 'create':
				case 'update':
					this.ls.writeObj(model.attributes);
					break;
				case 'delete':
					console.log('delete unimpl');
					break;
				case 'read':
					// Read existing settings from localStorage
					var values = this.ls.read();

					if (_.isEmpty(values)) {
						// Running for the first time if localStorage is empty
						this.save();
					} else {
						// Copy settings from localStorage to model's attributes
						_.extend(model.attributes, values);
					}

					return model;
			}
		},

		reset: function() {
			this.ls.clear(); // Clear localStorage
			this.clear({ silent: true });
			this.set(this.defaults);
			this.trigger('reset');
		}
	});

	app.settings = new app.Settings();
})();
