var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		// Marionette automatically renders the template
		template: '#settings-tmpl',

		initialize: function() {
			this.settings  = app.settings;
			this.whitelist = new app.TopicsWhitelist();
		},

		events: {
			'click #refresh' : 'refresh',
			'click #reset'   : 'settings.reset'
		},

		onRender: function() {
			rivets.bind(this.$el, {
				settings: this.settings
			});
		},

		refresh: function() {
			chrome.extension.sendMessage({
				type: 'refresh'
			});
		}
	});
})(jQuery);
