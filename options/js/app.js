var app = app || {};

rivets.binders.test = {
	// disabled: function() {
	// 	return !this.view.models.topic.get('enabled')
	// },

	routine: function() {
		console.log('routine', arguments, this);
		el.disabled = !value
	},

	bind: function(el) {
		var self = this;

		// this.binder.routine = _.bind(this.binder.routine, this);

		// this.disabled = function() {
		// 	return !self.view.models.topic.get('enabled')
		// };

		this.view.models.topic.on('change:enabled', function(model, val) {
			self.binder.routine(self.el);
		});

		// var adapter = rivets.config.adapter
		// var self = this

		// this.callback = function() {
		// 	currentValue = _.clone(adapter.read(self.model, self.keypath))

		// 	if(el.value && _.contains(currentValue, el.value)) {
		// 		newValue = _.without(currentValue, el.value)
		// 		adapter.publish(self.model, self.keypath, newValue)
		// 	} else {
		// 		currentValue.push(el.value)
		// 		adapter.publish(self.model, self.keypath, currentValue)
		// 	}
		// }

		// $(el).on('change', this.callback)
	},

	unbind: function(el) {
		console.log('unbind');
		this.view.models.topic.off('change:enabled');
	}
};

// _.bindAll(rivets.binders.test);

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

$(function() {
	new app.AppView();
});
