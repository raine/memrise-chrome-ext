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
		API_URL       : 'http://www.memrise.com/ajax/courses/dashboard/?courses_filter=most_recent&get_review_count=false',

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

		getCourses: function(cb) {
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

		parseLearningJSON: function(data, cb) {
			var courses = data.courses.map(function(c) {
				return _.pick(c, 'name', 'photo', 'url', 'review')
      });

			cb(null, courses);
		}
	};
})();
