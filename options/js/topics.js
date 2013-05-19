var app = app || {};

(function($) {
	'use strict';

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
			'change input': 'toggleCheckbox'
		},

		toggleCheckbox: function(ev) {
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
			this.on('change', this.wtf, this); // When models change
			this.on('reset', this.applyStorage, this);
		},

		// Returns the collection with only the values that are saved to localStorage
		toArray: function(){
			var topicKeys  = ['slug', 'enabled', 'courses'];
			var courseKeys = ['id', 'enabled'];

			var coll = this.toJSON();
			var filtered = coll.map(function(topic) {
				topic.courses = topic.courses.map(function(course) {
					return _.pick(course, courseKeys);
				});

				return _.pick(topic, topicKeys);
			});

			return filtered;
		},

		applyStorage: function() {
			// Write topics to localStorage
			var topicStore = app.settings.get('topics');

			topicStore.slice(0,1).forEach(function(t1) {
				// Find topic by slug
				var topic = this.find(function(t2) {
					return t2.get('slug') === t1.slug;
				})

				topic.set('enabled', t1.enabled);

				var courses = topic.get('courses');

				courses.map(function(c) {
					c.enabled
				});

				// t1.courses.forEach(function(c1) {
				// 	c
				// });
				// topic.get('courses').map(function(c) {
				// 	console.log(c);
				// });
				// var c= topic.get('courses');
				// console.log(c);
			}.bind(this));


			// this.each(function(topic) {
			// 	topic.set('enabled', false, { silent: true });
			// });
			// app.settings.set('topics', this.toArray());
		},

		sync: function(method, coll, options) {
			console.log('sync start', method, coll, options);

			if (method === 'read') {
				Memrise.getDB(function(html) {
					options.success(html);
				});
			}
		},

		parse: function(html) {
			var res = Memrise.parseHTML(html);
			if (typeof res === 'string') {
				throw('error', err);
			} else {
				return res;
			}
		},

		wtf: function(model, val, options) {
			console.log('wtf', model.toJSON());
		},
	});

	app.TopicsWhitelist = Backbone.View.extend({
		loadingEl : '#topics .loading',
		location  : '#topics .checkboxes',
		tagName   : 'ul',

		initialize: function() {
			this.topics = new app.Topics();
			this.listenTo(this.topics, 'reset', this.render);
			this.topics.fetch({ reset: true });
			this.loading();
		},

		render: function() {
			this.topics.each(function(topic) {
				var view = new app.TopicView({ model: topic });
				this.$el.append(view.render().el);
			}, this);

			$(this.location).html(this.el);
			return this;
		},

		loading: function() {
			$(this.location).append($(this.loadingEl).clone().show());
		}
	});
})(jQuery);
