var app = app || {};

(function($) {
	'use strict';

	app.SettingsView = Marionette.ItemView.extend({
		// Marionette automatically renders the template
		template: '#settings-tmpl',

		initialize: function() {
			this.whitelist = new app.TopicsWhitelist();
			this.stats     = new app.Stats();
			this.hotkeyP   = this.getHotkey();
		},

		events: {
			'click #refresh'           : 'refresh',
			'click #reset'             : 'reset',
			'click #test-notification' : 'testNotification',
			'click .plants'            : 'plantsClick',
			'click .go-to-ext'         : 'goToExtensions'
		},

		ui: {
			'topics'      : 'section#topics',
			'stats'       : 'section#stats .content',
			'description' : '.description',
			'plants'      : '#notifications .plants',
			'hotkey'      : 'section#hotkey .hotkey'
		},

		reset: function() {
			app.settings.reset();
		},

		onRender: function() {
			this.delegateEvents();

			this.hotkeyP.done(this.renderHotkey.bind(this));

			this.whitelist.setElement(this.ui.topics);
			this.whitelist.render();
			this.ui.stats.append(this.stats.render().el);

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
		},

		getHotkey: function() {
			var df = Q.defer();

			chrome.commands.getAll(function(hotkeys) {
				df.resolve(hotkeys[0].shortcut); // _execute_browser_action
			});

			return df.promise;
		},

		renderHotkey: function(hotkey) {
			if (hotkey.length > 0) {
				this.ui.hotkey.text(hotkey);
				this.$('.hotkey-on').show();
			} else {
				this.$('.hotkey-off').show();
			}
		},

		goToExtensions: function() {
			return chrome.tabs.create({ 'url': 'chrome://extensions' });
		}
	});
})(jQuery);
