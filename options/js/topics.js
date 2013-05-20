var app = app || {};

(function($) {
	'use strict';

	app.TopicView = Backbone.View.extend({
		bindings: null,

		initialize: function() {
			this.topicTmpl = _.template($('#topic-item').html());
		},

		render: function() {
			// Initialize topic DOM and the checkboxes
			this.setElement(this.topicTmpl().trim());
			this.bindings = rivets.bind(this.$el, { topic: this.model });
			return this;
		}
	});

	app.Topic = Backbone.DeepModel.extend({
		defaults: {
			enabled: true
		}
	});

	app.Topics = Backbone.Collection.extend({
		model: app.Topic,
		initialize: function() {
			this.on('change', this.save, this); // When models change
			this.on('reset', this.applyStorage, this);
		},

		// Returns the collection with only the values that are saved to localStorage
		toObject: function(){
			var coll = this.toJSON();
			var tObj = {};

			_.each(coll, function(topic) {
				var cObj = {}
				_.each(topic.courses, function(course) {
					cObj[course.id] = { enabled: course.enabled };
				});

				tObj[topic.slug] = { enabled: topic.enabled, courses: cObj }
			});

			return tObj;
		},

		applyStorage: function() {
			var topicStore = app.settings.get('topics');

			for (var slug in topicStore) {
				var tObj  = topicStore[slug];
				var topic = this.find(function(t) {
					return t.get('slug') === slug;
				});

				if (topic) {
					topic.set('enabled', tObj.enabled);
					topic.set('courses',
						topic.get('courses').map(function(c) {
							if (_.has(tObj.courses, c.id)) {
								c.enabled = tObj.courses[c.id].enabled;
							}

							return c;
						})
					);
				}
			}

			this.save();
		},

		save: function() {
			app.settings.set('topics', this.toObject());
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
		}
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
