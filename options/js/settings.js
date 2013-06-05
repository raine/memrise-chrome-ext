var app = app || {};

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

		validate: function(attrs) {
			var w = attrs['wilting-threshold'];
			if (isNaN(w) || w < 1) {
				return true;
			}
		},

		sync: function(method, model, options) {
			switch(method) {
				case 'create':
				case 'update':
					this.ls.writeObj(model.attributes);
					break;
				case 'delete':
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
