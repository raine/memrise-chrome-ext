var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		template: '#settings-tmpl',

		initialize: function() {
			this.settings  = app.settings;
			this.whitelist = new app.TopicsWhitelist();
		},

		events: {
			'click #refresh' : 'refresh',
			'click #reset'   : 'resetToDefaults'
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
		},

		resetToDefaults: function() {
			this.settings.reset();
		}
	});
})(jQuery);
