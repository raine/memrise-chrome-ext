var app = app || {};

(function($) {
	'use strict';

	var opts = app.Options = new Marionette.Application();

	opts.addRegions({
		content: '#content'
	});

	opts.addInitializer(function(options) {
		app.views = {
			changes  : new app.Changes(),
			settings : new app.SettingsView()
		};
	});

	opts.vent.on('view', function(view) {
		opts.content.show(app.views[view || 'settings']);
	});

	// Start router when topics collection is ready
	opts.vent.on('topics:ready', function(view) {
		new app.Router();
		Backbone.history.start();
	});
})(jQuery);

$(function() {
	app.Options.start();
});
