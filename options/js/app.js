var app = app || {};

(function($) {
	'use strict';

	app.Navigation = Marionette.ItemView.extend({
		el: '#header .nav',

		ui: {
			'settings' : 'li > a[href="/settings"]',
			'changes'  : 'li > a[href="/changes"]',
			'links'    : 'li'
		},

		events: {
			'click a': function(event) {
				var href = event.target.getAttribute('href');
				Backbone.history.navigate(href, { trigger: true });
				this.activeTab(href.replace('/', ''));
				return false;
			}
		},

		activeTab: function(name) {
			this.ui.links.removeClass('active');
			this.ui[name].parent().addClass('active');
		},

		initialize: function() {
			this.bindUIElements();
		}
	});
})(jQuery);

(function($) {
	'use strict';

	var opts = app.Options = new Marionette.Application();

	opts.addRegions({
		content: '#content'
	});

	opts.addInitializer(function(options) {
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

$(function() {
	app.Options.start();

	new app.Router();
	Backbone.history.start();
});
