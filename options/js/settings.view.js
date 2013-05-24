var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		// Marionette automatically renders the template
		template: '#settings-tmpl',

		events: {
			'click #refresh' : 'refresh',
			'click #reset'   : 'reset'
		},

		ui: {
			'topics': 'section#topics'
		},

		reset: function() {
			app.settings.reset();
		},

		onRender: function() {
			rivets.bind(this.$el, {
				settings: app.settings
			});

			this.whitelist = new app.TopicsWhitelist({ el: this.ui.topics });
		},

		refresh: function() {
			chrome.extension.sendMessage({
				type: 'refresh'
			});
		}
	});
})(jQuery);
