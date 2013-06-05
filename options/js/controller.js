var app = app || {};

(function($) {
	'use strict';

	app.OptionsController = Marionette.Controller.extend({
		initialize: function() {
			this.on('refresh', this.sendRefreshMessage);
			this.on('sendMessage', this.sendMessage);
			this.listenTo(app.settings, 'change:wilting-threshold change:topics', this.settingsChange);
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
