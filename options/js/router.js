var app = app || {};

(function($) {
	'use strict';

	app.Router = Backbone.Router.extend({
		routes: {
			':view'    : 'view',
			'*default' : 'index'
		},

		index: function() {
			Backbone.history.navigate('/settings', { replace: true });
			app.Options.showView('settings');
		},

		view: function(view) {
			app.Options.showView(view);
		}
	});
})(jQuery);
