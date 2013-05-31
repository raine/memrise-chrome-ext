var DEV_ENV = (chrome.app.getDetails().version === '0.0.1');
var OPTIONS_DEFAULTS = {
	"wilting-threshold": 1,
	"track-usage": true
};

var Memrise = {
	BASE_URL      : 'http://www.memrise.com',
	DASHBOARD_URL : 'http://www.memrise.com/home',
	LOGIN_URL     : 'http://www.memrise.com/login',
	API_URL       : 'http://www.memrise.com/api/category/learning/?with_num_ready_to_water',

	// TODO: use $.getJSON
	_get: function(url, callback) {
		var cb;
		if (DEV_ENV) {
			if (url === this.API_URL) {
				url = chrome.extension.getURL('/assets/learning.json');
			}

			cb = function() {
				var args = arguments;
				setTimeout(function() {
					callback.apply(null, args);
				}, 1000);
			};
		}

		return $.get(url, cb || callback);
	},

	getCategories: function(cb) {
		Memrise._get(this.API_URL, function(json) {
			Memrise.parseLearningJSON(json, cb);
		});
	},

	parseLearningJSON: function(json, cb) {
		var categories = JSON.parse(json).categories.map(function(c) {
			return _.extend(_.pick(c, 'name', 'slug'), {
				wilting: c.num_ready_to_water
			});
		});

		cb(categories);
	}
};
