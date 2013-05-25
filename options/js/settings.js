var app = app || {};

// Tests use this, therefore outside
var OPTIONS_DEFAULTS = {
	'wilting-threshold': 1,
	'track-usage': true
};

(function() {
	'use strict';

	app.Settings = Backbone.Model.extend({
		defaults: OPTIONS_DEFAULTS,

		initialize: function() {
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
					this._writeObj(model.attributes);
					break;
				case 'delete':
					console.log('delete unimpl');
					break;
				case 'read':
					// Read existing settings from localStorage
					var values = this._readObj();

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
			this._clear(); // Clear localStorage
			this.clear({ silent: true });
			this.set(this.defaults);
			this.trigger('reset');
		},

		_readObj: function() {
			var values = {};
			var prefix = "settings.";

			for (var i = (localStorage.length - 1); i >= 0; i--) {
				if (localStorage.key(i).indexOf(prefix) === 0) {
					var key = localStorage.key(i).substring(prefix.length);
					var value = this._getItem(key);
					if (value !== undefined) {
						values[key] = value;
					}
				}
			}

			return values;
		},

		_writeObj: function(obj) {
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					this._setItem(key, obj[key]);
				}
			}
		},

		_setItem: function(key, value){
			try {
				value = JSON.stringify(value);
			} catch (e) {
				value = null;
			}

			localStorage['settings.' + key] = value;
		},

		_getItem: function(key) {
			var value = localStorage['settings.' + key];
			if (value === null) { return undefined; }
			try { return JSON.parse(value); } catch (e) { return null; }
		},

		_clear: function() {
			var prefix = "settings.";
			for (var i = (localStorage.length - 1); i >= 0; i--) {
				if (localStorage.key(i).substring(0, prefix.length) === prefix) {
					localStorage.removeItem(localStorage.key(i));
				}
			}
		}
	});

	app.settings = new app.Settings();
})();
