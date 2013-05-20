var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Backbone.View.extend({
		el: '#settings',

		initialize: function() {
			this.settings  = app.settings;
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
