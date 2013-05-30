var app = app || {};

(function($) {
	'use strict';

	var opts = app.Options = new Marionette.Application();

	opts.addRegions({
		content: '#content'
	});

	opts.addInitializer(function(options) {
		app.controller = new app.OptionsController();
		app.views = {
			navigation : new app.Navigation(),
			changes    : new app.Changes(),
			settings   : new app.SettingsView()
		};
	});

	opts.showView = function(view) {
		app.views.navigation.activeTab(view);
		this.content.show(app.views[view]);
	};
})(jQuery);

if (document.location.search !== '?installed') {
	track('Options Opened');
}

$(function() {
	app.Options.start();
	new app.Router();
	Backbone.history.start();
});
