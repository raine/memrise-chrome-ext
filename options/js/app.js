var app = app || {};

rivets.configure({
	adapter: {
		subscribe: function(obj, keypath, callback) {
			console.log('subscribe', obj, keypath);
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
