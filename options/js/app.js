var app = app || {};

(function($) {
	'use strict';

	app.WhatsNewView = Marionette.ItemView.extend({
		initialize: function() {
			this.on('fetch', this.render);

			this.fetch(function(data) {
				this.data = data;
				this.trigger('fetch');	
			}.bind(this));
		},

		fetch: function(cb) {
			$.get(chrome.extension.getURL('CHANGES.html'), function(data) {
				cb(data);
			});
		},

		render: function() {
			this.$el.html(this.data);
		}
	});

	app.App = new Marionette.Application();
	app.App.addRegions({
		content: '#content'
	})

	app.App.addInitializer(function(options) {
		var whatsnew = new app.WhatsNewView();
		var settings = new app.SettingsView();

		app.App.content.show(settings);
	});
})(jQuery);

$(function() {
	app.App.start();
});
