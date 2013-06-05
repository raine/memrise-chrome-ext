var DEV_ENV = (chrome.app.getDetails().version === '0.0.1');
var OPTIONS_DEFAULTS = {
	"wilting-threshold" : 1,
	"track-usage"       : true,
	"notifications"     : true
};

var Memrise = (function() {
	return {
		BASE_URL      : 'http://www.memrise.com',
		DASHBOARD_URL : 'http://www.memrise.com/home',
		LOGIN_URL     : 'http://www.memrise.com/login',
		API_URL       : 'http://www.memrise.com/api/category/learning/?with_num_ready_to_water=true',

		_get: function(url, success, error) {
			if (localStorage.USE_MOCK_DATA) {
				if (url === this.API_URL) {
					url = chrome.extension.getURL('/assets/learning.json');
					url = 'http://localhost:8080/learning.json';

					var params = {};
					if ('nologin' in window) params.nologin = true;
					if ('w' in window) params.wilting = window.w;
					if (!_.isEmpty(params)) url += '?' + $.param(params);
				}
			}

			return $.ajax(url, {
				success  : success,
				error    : error,
				dataType : 'json'
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
			var categories = json.categories.map(function(c) {
				return _.extend(_.pick(c, 'name', 'slug', 'photo'), {
					wilting   : c.num_ready_to_water,
					courses   : [],
					waterPath : "/garden/water/" + c.slug + "/"
				});
			});

			cb(null, categories);
		}
	};
})();
