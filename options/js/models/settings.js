var app = app || {};

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
			this.save();  //  Write to localStorage, in case of first run
		},

		sync: function(method, model, options) {
			console.log(method, model);

			switch(method) {
				case 'create':
				case 'update':
					this._writeObj(model.attributes);
					break;
				case 'delete':
					console.log('delete unimpl');
					break;
				case 'read':
					var values = {};
					var prefix = "settings.";
					for (var i = (localStorage.length - 1); i >= 0; i--) {
						if (localStorage.key(i).substring(0, prefix.length) === prefix) {
							var key = localStorage.key(i).substring(prefix.length);
							var value = this._getItem(key);
							if (value !== undefined) { values[key] = value; }
						}
					}

					for (var key in values) {
						if (!model.hasOwnProperty(key)) {
							model.attributes[key] = values[key];
						}
					}

					return model;
			}
		},

		reset: function() {
			this._clear();
			this.save(this.defaults);
		},

		_writeObj: function(obj) {
			for (var key in obj) {
				localStorage['settings.' + key] = obj[key];
			}
		},

		_getItem: function(key) {
			var value = localStorage['settings.' + key]
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
})();
