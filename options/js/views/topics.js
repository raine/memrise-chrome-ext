var app = app || {};

(function($) {
	'use strict';

	var topics = [
		{
			"name": "Animals",
			"slug": "animals"
		},
		{
			"name": "English",
			"slug": "english"
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

	app.Topic = Backbone.Model.extend({

	});

	app.Topics = Backbone.Collection.extend({
		model: app.Topic,
		initialize: function() {
			this.set(topics.map(function(t) {
				return new app.Topic({ name: t.name, slug: t.slug });
			}));
		}
	});

	app.TopicsWhitelist = Backbone.View.extend({
		tagName: 'ul',

		initialize: function() {
			this.topicTmpl = _.template($('#topic-item').html());
			this.topics = new app.Topics();
			this.render();
		},

		render: function() {
			this.$el.html('');

			this.topics.forEach(function(topic) {
				this.$el.append(this.topicTmpl(topic.toJSON()));
			}.bind(this));

			$('#topics .checkboxes').html(this.el);
			return this;
		}
	});
})(jQuery);


// rivets.bind(this.$el, {
// 	topics: this.topicsWhitelist
// });
