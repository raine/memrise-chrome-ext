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
			this.listenTo(this.model, 'change', this.refreshTopic);
			this.refreshTopic();
			return this;
		},

		refreshTopic: function() {
			this.$el.find('.topic-checkbox').prop('disabled', this.allUnchecked());
		},

		allUnchecked: function() {
			return $(this.$el).find('.courses input:checked').length === 0;
		}
	});

	app.Course = Backbone.Model.extend({
		defaults: {
			enabled: true
		}
	});

	app.Topic = Backbone.DeepModel.extend({
		defaults: {
			enabled: true
		},

		initialize: function(attr, opts) {
			// XXX: Courses should possibly be a Collection that has models.
			// Change events would be visible to the collection and wouldn't
			// have to bind separately.
			// Trigger change on Topic if a course changes
			var courses = attr.courses.map(function(c) {
				var c = new app.Course(c);
				this.listenTo(c, 'change', function() {
					this.trigger('change', c);
				});

				return c;
			}, this);

			this.set('courses', courses);
		},

		reset: function() {
			this.set('enabled', true);
			_.invoke(this.get('courses'), 'set', 'enabled', true);
		},
	});

	app.Topics = Backbone.Collection.extend({
		model: app.Topic,
		initialize: function() {
			this.on('reset', this.applyStorage, this);
			this.listenTo(app.settings, 'reset', this.settingsReset);
		},

		settingsReset: function() {
			_.invoke(this.models, 'reset');
			// If none of the models change because of the reset, save()
			// won't be called. This ensures that topics are added to
			// localStorage after a reset.
			this.save();
		},

		// Returns the collection with only the values that are saved to localStorage
		// { `topic.slug`: { enabled: true, courses: { `course.id`: { enabled: true } } }, ... }
		toObject: function(){
			return _.object(this.map(function(topic) {
				return [ topic.get('slug'), {
					enabled: topic.get('enabled'),
					courses: _.object(topic.get('courses').map(function(course) {
						return [ course.get('id'), { enabled: course.get('enabled') } ];
					}))
				}];
			}));
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
					topic.get('courses').forEach(function(c) {
						var id = c.get('id');
						if (_.has(tObj.courses, id)) {
							c.set('enabled', tObj.courses[id].enabled);
						}
					});
				}
			}

			this.on('change', this.save, this); // When models change
			this.save();
		},

		save: function() {
			this.sync('create', this);
		},

		sync: function(method, coll, options) {
			if (method === 'read') {
				Memrise.getDB(function(html) {
					options.success(html);
				});
			} else if (method === 'create') {
				// When the models are reset, 'change' triggers multiple times and
				// save is called. With this the topics are sent as a batch
				// to localStorage. I feel this is better than using silent: true
				// or unbinding 'change' until reset is done.
				clearTimeout(this.timer);
				var set    = _.bind(app.settings.set, app.settings);
				this.timer = _.delay(set, 50, 'topics', this.toObject());
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
