var app = app || {};

(function($) {
	'use strict';

	app.AppView = Backbone.View.extend({
		el: '#app',

		initialize: function() {
			this.settings  = new app.Settings();
			this.whitelist = new app.TopicsWhitelist();

			rivets.bind(this.$el, {
				settings: this.settings
			});
		},

		events: {
			'click #refresh' : 'refresh',
			'click #reset'   : 'resetToDefaults'
		},

		refresh: function() {
			chrome.extension.sendMessage({
				type: 'refresh'
			});
		},

		resetToDefaults: function() {
			this.settings.reset();
		}
	});
})(jQuery);
