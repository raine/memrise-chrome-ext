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

	_get: function(url, success, error) {
		if (DEV_ENV) {
			if (url === this.API_URL) {
				url = chrome.extension.getURL('/assets/learning.json');
			}
		}

		return $.ajax(url, {
			success : success,
			error   : error
		});
	},

	getCategories: function(cb) {
		return Memrise._get(this.API_URL, function(data) {
			Memrise.parseLearningJSON(data, cb);
		}, function(xhr) {
			if (xhr.status === 403) {
				cb('not-logged-in');
			} else {
				cb('error');
			}
		});
	},

	parseLearningJSON: function(json, cb) {
		var categories = JSON.parse(json).categories.map(function(c) {
			return _.extend(_.pick(c, 'name', 'slug'), {
				wilting: c.num_ready_to_water
			});
		});

		cb(null, categories);
	}
};
