var app = app || {};

(function($) {
	app.Router = Backbone.Router.extend({
		routes: {
			"changes": "changes",
			"*actions": "settings"
		},
	
		changes: function() {
			app.Options.vent.trigger('view', 'changes');
		},

		settings: function() {
			app.Options.vent.trigger('view', 'settings');
		}
	});
})(jQuery);
