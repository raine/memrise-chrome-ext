'use strict';

var app = app || {};

var OPTIONS_DEFAULTS = {
	'wilting-threshold': 1,
	'track-usage': true
};

rivets.configure({
	adapter: {
		subscribe: function(obj, keypath, callback) {
			obj.on('change:' + keypath, callback);
		},
		unsubscribe: function(obj, keypath, callback) {
			obj.off('change:' + keypath, callback);
		},
		read: function(obj, keypath) {
			return obj.get(keypath);
		},
		publish: function(obj, keypath, value) {
			console.log('publish', keypath, value);
			obj.set(keypath, value);
		}
	}
});

rivets.formatters.number = {
	read: function(value) {
		return value;
	},
	publish: function(value) {
		return +value;
	}
};

(function() {
	app.Settings = Backbone.Model.extend({
		defaults: OPTIONS_DEFAULTS,

		initialize: function() {
			this.on('change', function(model) {
				model.save();
			});

			this.sync('read', this);
			this.sync('update', this);
		},

		sync: function(method, model, options) {
			switch(method) {
				case 'create':
					this._writeObj(model.changed);
					break;
				case 'update':
					this._writeObj(model.attributes);
					break;
				case 'delete':
					console.log('delete unimpl');
					break;
				case 'read':
					var values = {};
					var name = "settings.";
					for (var i = (localStorage.length - 1); i >= 0; i--) {
						if (localStorage.key(i).substring(0, name.length) === name) {
							var key = localStorage.key(i).substring(name.length);
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

		_writeObj: function(obj) {
			for (var key in obj) {
				localStorage['settings.' + key] = obj[key];
			}
		},

		_getItem: function(key) {
			var value = localStorage['settings.' + key]
			if (value === null) { return undefined; }
			try { return JSON.parse(value); } catch (e) { return null; }
		}
	});
})();

(function($) {
	app.AppView = Backbone.View.extend({
		el: '#app',

		initialize: function() {
			var settings = new app.Settings();

			rivets.bind(this.$el, {
				settings: settings
			});
		},

		events: {
			'click #refresh': 'refresh'
		},

		refresh: function() {
			chrome.extension.sendMessage({
				type: 'refresh'
			});
		}
	});
})(jQuery);

$(function() {
	new app.AppView();
});
