var app = app || {};

(function($) {
	app.Router = Backbone.Router.extend({
		routes: {
			':tab'     : 'view',
			'*actions' : 'view'
		},

		view: function(view) {
			app.Options.vent.trigger('view', view);
		}
	});
})(jQuery);
