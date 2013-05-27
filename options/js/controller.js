var app = app || {};

(function($) {
	'use strict';

	app.OptionsController = Marionette.Controller.extend({
		initialize: function() {
			this.listenTo(app.settings, 'change', this.settingsChange);
			this.on('refresh', this.sendRefreshMessage);
		},

		settingsChange: function() {
			this.sendRefreshMessage(true);
		},

		sendRefreshMessage: function(cache) {
			chrome.extension.sendMessage({
				type: cache ? 'refresh-from-cache' : 'refresh'
			});
		},

		onClose: function() {
			this.off('refresh');
		}
	});
})(jQuery);
