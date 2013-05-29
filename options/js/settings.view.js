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
			'topics': 'section#topics'
		},

		reset: function() {
			app.settings.reset();
		},

		onRender: function() {
			rivets.bind(this.$el, {
				settings: app.settings,
				topics: this.whitelist.topics
			});

			this.delegateEvents();
			this.whitelist.setElement(this.ui.topics);
			this.whitelist.render();
		},

		refresh: function() {
			app.controller.triggerMethod('refresh', false);
		}
	});
})(jQuery);
