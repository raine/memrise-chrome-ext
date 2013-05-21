var app = app || {};

(function($) {
	'use strict';

	app.Options = new Marionette.Application();
	app.Options.addRegions({
		content: '#content'
	})

	app.Options.addInitializer(function(options) {
		var whatsnew = new app.Changes();
		var settings = new app.SettingsView();

		app.Options.content.show(settings);
	});
})(jQuery);

$(function() {
	app.Options.start();
});
