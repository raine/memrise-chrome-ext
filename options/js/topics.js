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

	app.Course = Backbone.Model.extend({
		defaults: {
			enabled: true
		}
	});

	app.Topic = Backbone.Model.extend({
		defaults: {
			enabled: true
		},

		initialize: function(attr, opts) {
			// XXX: Courses should possibly be a Collection that has models.
			// Change events would be visible to the collection and wouldn't
			// have to bind separately.
			// Trigger change on Topic if a course changes
			var courses = attr.courses.map(function(c) {
				c = new app.Course(c);
				this.listenTo(c, 'change:enabled', function() {
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
							c.set('enabled', tObj.courses[id].enabled, { silent: true });
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
				return Memrise.getCategories(function(err, res) {
					if (err) {
						options.error(err);
					} else {
						options.success(res);
					}
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
		}
	});

	app.TopicsWhitelist = Marionette.ItemView.extend({
		initialize: function() {
			this.topics = new app.Topics();
			this.fetch();
		},

		ui: {
			'checkboxes' : '.checkboxes',
			'loading'    : '.loading',
			'nologin'    : '.not-logged-in'
		},

		fetch: function() {
			var self = this;

			return this.topics.fetch({
				reset: true,
				error: this.fetchError.bind(this)
			}).always(function() {
				if (typeof self.ui.loading === 'object') {
					self.ui.loading.hide();
				}
			});
		},

		render: function() {
			this.bindUIElements();

			if (this.topics.length > 0) {
				this.renderTopics();
			} else {
				this.listenTo(this.topics, 'reset', this.renderTopics);
				this.ui.loading.show();
			}

			return this;
		},

		renderTopics: function() {
			this.ui.nologin.hide();

			this.topicViews = this.topics.map(function(topic) {
				return new app.TopicView({ model: topic });
			});

			var ul = $('<ul>');
			_.chain(this.topicViews)
				.invoke('render').pluck('$el')
				.invoke('appendTo', ul);
			ul.appendTo(this.ui.checkboxes);

			return this;
		},

		fetchError: function(coll, err, options) {
			if (err === 'not-logged-in') {
				this.ui.nologin.show();
			}
		},
	});
})(jQuery);
