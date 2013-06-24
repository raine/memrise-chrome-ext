var app = app || {};

(function($) {
	'use strict';

	var Stats = {
		get: function() {
			var df = Q.defer();
			this.getSessions()
				.then(function(sessions) {
					if (_.isEmpty(sessions)) {
						df.resolve({});
					} else {
						df.resolve({
							timeSpent : this.measureTimeSpent(sessions),
							activity  : this.measureLastMonthActivity(sessions)
						});
					}
				}.bind(this));

			return df.promise;
		},

		measureTimeSpent: function(sessions) {
			var ms = sessions.reduce(function(prev, cur) {
				return prev + cur.real_time_spent;
			}, 0);

			return ms;
		},

		measureLastMonthActivity: function(sessions) {
			var getDayTimestamp = function(date) {
				return (new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime();
			};

			var now    = new Date();
			var curDay = getDayTimestamp(now);
			var days   = [];

			for (var i=0; i < 30; i++) {
				var d = curDay - 60 * 60 * 24 * 1000 * i;
				days.unshift(d);
			}

			sessions = sessions.map(function(obj) {
				obj.midnight = getDayTimestamp(new Date(obj.start_time));
				obj.answers  = obj.num_correct + obj.num_incorrect;
				return obj;
			});

			var grouped = _.groupBy(sessions, function(session) {
				return session.midnight;
			});

			days = days.map(function(midnight) {
				if (midnight in grouped) {
					return grouped[midnight].reduce(function(prev, cur) {
						return prev + cur.answers;
					}, 0);
				} else {
					return 0;
				}
			});

			return days;
		},

		getSessions: function(cb) {
			 var df = Q.defer();
			 chrome.storage.local.get('sessions', function(obj) {
				 df.resolve(obj.sessions);
			 });
			 return df.promise;
		}
	};

	var StatsFormatter = {
		STRINGS: {
			'timeSpent'     : 'Time spent in garden',
			'activity'      : 'Activity last 30 days'
		},

		formatValue: {
			'timeSpent': function(ms) {
				var timeUnits = StatsFormatter.convertMS(ms);
				var unitsStr  = StatsFormatter.formatTimeUnits(timeUnits);
				return unitsStr;
			},

			'activity': function(arr) {
				return '<span class="bar">' + arr.join(',') + '</span>';
			}
		},

		convertMS: function(ms)  {
			var d, h, m, s;
			s = Math.floor(ms / 1000);
			m = Math.floor(s / 60);
			s = s % 60;
			h = Math.floor(m / 60);
			m = m % 60;
			d = Math.floor(h / 24);
			h = h % 24;
			return { d: d, h: h, m: m, s: s };
		},
		
		formatTimeUnits: function(timeUnits) {
			var UNITS = [ [ 'd', 'day' ], [ 'h', 'hour' ], [ 'm', 'minute' ], [ 's', 'second' ] ];
			var units = [];
			UNITS.forEach(function(e) {
				var char  = e[0];
				var word  = e[1];
				var value = timeUnits[char];
				if (value > 0) {
					var str = value + ' ' + word;
					if (value !== 1) str += 's';
					units.push(str);
				}
			});

			var str = units.slice(0, -1).join(', ');
			if (units.length > 1) str += ' and ';
			str += units.slice(-1)[0];

			return str;
		}
	};

	app.Stats = Marionette.ItemView.extend({
		tagName: 'dl',

		rowTmpl: _.template(
			"<dt><%= title %></dt>" +
			"	<dd><%= value %></dd>"
		),
		
		initialize: function() {
			this.stats = Stats.get();
		},

		render: function(obj) {
			if (obj === undefined) {
				this.stats.done(this.render.bind(this));
				return this;
			}

			this.$el.empty();

			if (_.isEmpty(obj)) {
				this.$el.html('No statistics');
				return this;
			}

			for (var key in obj) {
				var value = obj[key];
				if (key in StatsFormatter.formatValue) {
					value = StatsFormatter.formatValue[key](value);
				}

				this.$el.append(this.rowTmpl({
					title: StatsFormatter.STRINGS[key],
					value: value
				}));
			}

			this.$('.bar').peity('bar', {
				colours: [ '#4d89f9' ],
				delimiter: ',',
				height: 24,
				spacing: 1,
				width: 120
			});

			return this;
		},
	});
})(jQuery);
