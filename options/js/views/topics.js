var app = app || {};

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

	app.TopicView = Backbone.View.extend({
		initialize: function() {
			this.topicTmpl = _.template($('#topic-item').html());
		},

		render: function() {
			var self = this;

			// Initialize topic DOM and the checkboxes
			this.setElement(this.topicTmpl(this.model.toJSON()).trim());
			this.$el.find('input').each(function(i, input) {
				var keyPath = $(input).attr('data-keypath');
				$(input).prop('checked', self.model.get(keyPath));
			});

			return this;
		},

		events: {
			'change input': 'checkboxToggle'
		},

		checkboxToggle: function(ev) {
			var $input  = $(ev.target);
			var keyPath = $input.attr('data-keypath');
			this.model.set(keyPath, !this.model.get(keyPath));
		}
	});

	app.Topic = Backbone.DeepModel.extend({
		defaults: {
			enabled: true
		},

		initialize: function() {
			_.each(this.attributes.courses, function(c, index) {
				c.enabled = true;
				c.keyPath = "courses." + index +  ".enabled";
			});
		}
	});

	app.Topics = Backbone.Collection.extend({
		model: app.Topic,
		initialize: function() {
			this.set(topics.map(function(t) {
				return new app.Topic({
					name: t.name,
					slug: t.slug,
					courses: t.courses
				});
			}));
		},
	});

	app.TopicsWhitelist = Backbone.View.extend({
		location: '#topics .checkboxes',
		tagName: 'ul',

		initialize: function() {
			this.topics = new app.Topics();
			this.render();
		},

		render: function() {
			this.$el.empty();

			this.topics.each(function(topic) {
				var view = new app.TopicView({ model: topic });
				this.$el.append(view.render().el);
			}, this);

			$(this.location).html(this.el);
			return this;
		}
	});
})(jQuery);
