rivets.binders['disable-if'] = {
	// Using my own routine since this function gets called from outside with
	// value for which I have no use.
	routine: function(el, value) { },

	bind: function(el) {
		var self = this;

		var checkCourses = function() {
			var courses = self.model.get('courses');

			el.disabled = courses.every(function(c) {
				return !c.get('enabled');
			});
		};

		this.change = checkCourses;
		this.change();

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
