(function($) {
	'use strict';

	var topics = [
		{
			"name": "Animals",
			"slug": "animals",
			"courses": [
				{	
					"name": "Horses",
					"slug": "horses"
				},
				{	
					"name": "Dogs",
					"slug": "dogs"
				}
			]
		},
		{
			"name": "English",
			"slug": "english",
			"courses": [
				{	
					"name": "Cast Out",
					"slug": "cast-out"
				},
				{	
					"name": "SAT Essential",
					"slug": "sat-essential"
				}
			]
		}
	];

	app.Topics = Backbone.View.extend({
		el: '#topics .checkboxes',

		initialize: function() {
			this.template = _.template($('#topics-whitelist').html());
			this.render();
		},

		render: function() {
			this.$el.html(this.template({ topics: topics }));
		}
	});
})(jQuery);
