// <dt>Time spent in garden</dt>
// <dd>1 day, 2 hours, 32 minutes, 20 seconds</dd>
// <dt>Longest streak</dt>
// <dd>32 correct</dd>

var app = app || {};

(function($) {
	'use strict';

	var Stats = {
		get: function() {
			var df = Q.defer();
			this.getSessions()
				.then(function(sessions) {
					df.resolve({
						timeSpent: this.measureTimeSpent(sessions),
						longestStreak: this.measureLongestStreak(sessions)
					});
				}.bind(this));

			return df.promise;
		},

		measureTimeSpent: function(sessions) {
			var ms = sessions.reduce(function(prev, cur) {
				return prev + cur.real_time_spent;
			}, 0);

			return ms;
		},

		measureLongestStreak: function(sessions) {
			var ls = sessions.reduce(function(prev, cur) {
				return prev < cur.longest_streak ? cur.longest_streak : prev;
			}, 0);

			return ls;
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
			'longestStreak' : 'Longest streak',
			'timeSpent'     : 'Time spent in garden'
		},

		formatValue: {
			'timeSpent': function(ms) {
				var timeUnits = StatsFormatter.convertMS(ms);
				var unitsStr  = StatsFormatter.formatTimeUnits(timeUnits);
				return unitsStr;
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
			if (!obj) {
				this.stats.done(this.render.bind(this));
				return this;
			}

			this.$el.empty();

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

			return this;
		},
	});
})(jQuery);
