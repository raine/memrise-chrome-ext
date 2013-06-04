rivets.binders['show-if-any-disabled'] = {
	// Using my own routine since this function gets called from outside with
	// value for which I have no use.
	routine: function(el, value) { },

	bind: function(el) {
		var self = this;

		var anyDisabled = function() {
			return self.model.models.some(function(t) {
				return t.get('courses').some(function(c) {
					return c.get('enabled') === false;
				});
			});
		};

		var checkTopics = function(arg) {
			if (anyDisabled()) {
				$(el).slideDown(arg === true ? 0 : void(0));
			} else {
				$(el).slideUp();
			}
		};

		this.change = checkTopics;
		this.model.on('change',  this.change);
		this.model.once('reset', this.change.bind(this, true));
	},

	unbind: function() {
		this.model.off('change', this.change);
	}
};

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
			obj.set(keypath, value, { validate:true });
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
