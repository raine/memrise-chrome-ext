var app = app || {};

(function($) {
	'use strict';

	var opts = app.Options = new Marionette.Application();

	opts.addRegions({
		content: '#content'
	})

	opts.addInitializer(function(options) {
		app.views = {
			changes  : new app.Changes(),
			settings : new app.SettingsView()
		}
	});

	opts.vent.on('view', function(view) {
		opts.content.show(app.views[view]);
	});
})(jQuery);

$(function() {
	app.Options.on('start', function(options) {
		new app.Router();
		Backbone.history.start(); // Great time to do this
	});

	app.Options.start();
});
