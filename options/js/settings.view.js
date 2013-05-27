var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		// Marionette automatically renders the template
		template: '#settings-tmpl',

		initialize: function() {
			this.whitelist = new app.TopicsWhitelist();
			this.listenTo(app.settings, 'change', this.refresh.bind(this, 'cache'));
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
				settings: app.settings
			});

			this.delegateEvents();
			this.whitelist.setElement(this.ui.topics);
			this.whitelist.render();
		},

		refresh: function(arg) {
			console.log('refresh', arg);

			var type;
			if (arg === 'cache') {
				 // HACK: 'change' fires twice on settings when resetting,
				 // once from resetting to defaults and again from setting the
				 // topics. This makes sure that refresh is called only once
				 // when resetting.
				 // if (app.settings.get('topics') === undefined) {
				 //     return;
				 // }

				type = 'refresh-from-cache';
			} else {
				type = 'refresh';
			}

			chrome.extension.sendMessage({
				type: type
			});
		}
	});
})(jQuery);
