var app = app || {};

(function($) {
	'use strict';

	app.OptionsController = Marionette.Controller.extend({
		initialize: function() {
			this.listenTo(app.settings, 'change', this.settingsChange);
			this.on('refresh', this.sendRefreshMessage);
			this.on('sendMessage', this.sendMessage);
		},

		settingsChange: function() {
			this.sendRefreshMessage(true);
		},

		sendRefreshMessage: function(cache) {
			this.sendMessage(cache ? 'refresh-from-cache' : 'refresh');
		},

		sendMessage: function(type) {
			chrome.extension.sendMessage({
				type: type
			});
		},

		onClose: function() {
			this.off('refresh');
		}
	});
})(jQuery);
