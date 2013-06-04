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
			'click #refresh'           : 'refresh',
			'click #reset'             : 'reset',
			'click #test-notification' : 'testNotification',
			'click .plants'            : 'plantsClick'
		},

		ui: {
			'topics'      : 'section#topics',
			'description' : '.description',
			'plants'      : '#notifications .plants'
		},

		reset: function() {
			app.settings.reset();
		},

		onRender: function() {
			this.delegateEvents();
			this.whitelist.setElement(this.ui.topics);
			this.whitelist.render();

			_.defer(this.initializePlugins.bind(this));
		},

		refresh: function() {
			app.controller.triggerMethod('refresh', false);
		},

		testNotification: function() {
			app.controller.triggerMethod('sendMessage', 'test-notification');
		},

		initializePlugins: function() {
			var scroller = this.ui.description.scrollText('.description-enabled');

			if (this.bindings) {
				this.bindings.unbind();
			}

			this.bindings = rivets.bind(this.$el, {
				settings : app.settings,
				topics   : this.whitelist.topics
			});
		},

		plantsClick: function() {
			this.$('.wilting-threshold').focus();
		}
	});
})(jQuery);
