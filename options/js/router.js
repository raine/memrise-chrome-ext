var app = app || {};

(function($) {
	'use strict';

	app.Router = Backbone.Router.extend({
		routes: {
			':view'    : 'view',
			'*actions' : 'default'
		},

		default: function() {
			this.navigate('/settings', { trigger: true });
		},

		view: function(view) {
			app.Options.showView(view);
		}
	});
})(jQuery);
