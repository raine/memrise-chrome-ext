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

