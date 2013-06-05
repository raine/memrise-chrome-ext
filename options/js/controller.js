var app = app || {};

(function($) {
	'use strict';

	app.OptionsController = Marionette.Controller.extend({
		initialize: function() {
			this.on('refresh', this.sendRefreshMessage);
			this.on('sendMessage', this.sendMessage);
			this.listenTo(app.settings, 'change', this.settingsChange);
		},

		settingsChange: function(model) {
			var tracked = [ 'wilting-threshold', 'topics' ];
			var changed = _.keys(model.changed);
			if (!_.isEmpty(_.intersection(changed, tracked))) {
				this.sendRefreshMessage(true);
			}

			mixpanel.register({
				'Wilting Threshold'     : model.get('wilting-threshold'),
				'Notifications Enabled' : model.get('notifications')
			});
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
