var app = app || {};

rivets.binders['disable-if'] = {
	routine: function(el, courses) {
		el.disabled = courses.every(function(c) {
			return !c.get('enabled');
		});
	},

	bind: function(el) {
		var self = this;

		this.change = function() {
			self.binder.routine(self.el, this.get('courses'));
		};

		this.model.on('change', this.change);
	},

	unbind: function() {
		this.model.off('change', this.change);
	}
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

$(function() {
	new app.AppView();
});
