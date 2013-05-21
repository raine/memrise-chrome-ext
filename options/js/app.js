var app = app || {};

(function($) {
	'use strict';

	app.App = new Marionette.Application();
	app.App.addRegions({
		content: '#content'
	})

	app.App.addInitializer(function(options) {
		var whatsnew = new app.Changes();
		var settings = new app.SettingsView();

		app.App.content.show(settings);
	});
})(jQuery);

$(function() {
	app.App.start();
});
