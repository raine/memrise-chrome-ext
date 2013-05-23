var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		// Marionette automatically renders the template
		template: '#settings-tmpl',

		initialize: function() {
			this.whitelist = new app.TopicsWhitelist();
		},

		events: {
			'click #refresh' : 'refresh',
			'click #reset'   : 'reset'
		},

		ui: {
			'topics': '#topics .checkboxes'
		},

		reset: function() {
			app.settings.reset();
		},

		onRender: function() {
			rivets.bind(this.$el, {
				settings: app.settings
			});

			var topics = this.whitelist.render().el;
			this.ui.topics.html(topics);
		},

		refresh: function() {
			chrome.extension.sendMessage({
				type: 'refresh'
			});
		}
	});
})(jQuery);
