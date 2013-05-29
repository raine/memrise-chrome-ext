var DEV_ENV = (chrome.app.getDetails().version === '0.0.1');
var OPTIONS_DEFAULTS = {
	"wilting-threshold": 1,
	"track-usage": true
};

var Memrise = {
	BASE_URL      : 'http://www.memrise.com',
	DASHBOARD_URL : 'http://www.memrise.com/home',
	LOGIN_URL     : 'http://www.memrise.com/login',

	getDB: function(callback) {
		var cb;
		var url = this.DASHBOARD_URL;
		if (DEV_ENV) {
			url = chrome.extension.getURL('/assets/home.html');
			cb = function() {
				var args = arguments;
				setTimeout(function() {
					callback.apply(null, args);
				}, 1000);
			};
		}

		return $.get(url, cb || callback);
	},

	parseHTML: function(html) {
		if (html.search(/'is_authenticated': false/) >= 0) {
			return 'not-logged-in';
		}

		html = html.replace(/<img\b[^>]*\/>/ig,'');
		var $html  = $($.parseHTML(html));
		var groups = [];

		// .whitebox is a single group of courses, like "Animals"
		$html.find('.container-main .page .whitebox').each(function() {
			var group = {
				name: $('.groupname', this).text(),
				wilting: 0,
				courses: []
			};

			// Create slug from the name
			group.slug = group.name
				.toLowerCase()
				.replace(/[^a-z\s]*/g, '')
				.replace(/\s+/, '-');

			var m, href, btn = $('.group-header .btn', this);
			if (href = btn.attr('href')) {
				group.waterPath = href;

				if (m = btn.text().match(/Water\s*\(?(\d+)\)?/)) {
					group.wilting = parseInt(m[1]);
				}
			}

			$('.course-box-wrapper', this).each(function() {
				var course = {
					name: $('a.inner-wrap', this).attr('title'),
					id: parseInt($('.course-progress-box', this).attr('data-course-id')),
					wilting: 0
				};

				// TODO: you could combine these because both can't be active
				var $water = $('.cta-wrap .btn[href*="water"]', this);
				if ($water.length > 0) {
					course.waterPath = $water.attr('href');

					if (m = $water.text().match((/Water\s*\(?(\d+)\)?/))) {
						course.wilting = parseInt(m[1]);
					}
				}

				var $harvest = $('.ctn-wrap btn[href*="harvest"]', this);
				if ($harvest.length > 0) {
					course.harvestPath = $harvest.attr('href');

					// Make it easier to check which groups have harvestable
					group.harvestable = true;
				}

				group.courses.push(course);
			});

			groups.push(group);
		});

		return groups;
	}
};
