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

	rivets.binders.append = {
		// The thing that decides if the element should be checked
		routine: function(el, value) {
			// el.checked = _.contains(value, el.value)
			console.log('routine', value);
			el.checked = true;
		},

		bind: function(el) {
			var adapter = rivets.config.adapter;
			var self = this;

			this.callback = function() {
				adapter.publish(self.model, self.keypath, 'foo');
			};

			// 	currentValue = _.clone(adapter.read(self.model, self.keypath))
			// 	if(el.value && _.contains(currentValue, el.value)) {
			// 		newValue = _.without(currentValue, el.value)
			// 		adapter.publish(self.model, self.keypath, newValue)
			// 	} else {
			// 		currentValue.push(el.value)
			// 		adapter.publish(self.model, self.keypath, currentValue)
			// 	}
			// }
			// console.log(el);

			$(el).on('change', this.callback)
		},

		unbind: function(el) {
			$(el).off('change', this.callback)
		}
	}

	app.TopicView = Backbone.View.extend({
		initialize: function() {
			this.topicTmpl = _.template($('#topic-item').html());
		},

		render: function() {
			var self = this;

			this.$el.html(this.topicTmpl(this.model.toJSON()));
			this.$el.find('input').each(function(i, input) {
				var keyPath = $(input).attr('data-keypath');
				$(input).prop('checked', self.model.get(keyPath));
			});

			return this;
		},

		events: {
			'change input': 'somethingHappened'
		},

		somethingHappened: function(ev) {
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
			_.each(this.attributes.courses, function(c) {
				c.enabled = true;
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
			this.$el.html('');

			this.topics.forEach(function(topic) {
				var view = new app.TopicView({ model: topic });
				this.$el.append(view.render().el);
			}.bind(this));

			$(this.location).html(this.el);
			return this;
		}
	});
})(jQuery);
