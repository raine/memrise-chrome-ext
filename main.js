var BASE_URL      = 'http://www.memrise.com';
var DASHBOARD_URL = BASE_URL + '/home/';
var LOGIN_URL     = BASE_URL + '/login/';

var COLORS = {
	harvest: [ 250, 177, 31, 255 ],
	wilting: [ 21, 161, 236, 255 ]
};

var STRINGS = {
	harvest: "%s: Harvest plants",
	wilting: "%s: Water %d wilting plant"
};

var UPDATE_INTERVAL = 5 * 60 * 1000;
var action, noLogin;

var settings = new Store("settings", DEFAULTS);

chrome.browserAction.onClicked.addListener(function() {
	if (action) {
		action();
	}
});

var createTab = function(url) {
	return function() {
		chrome.tabs.create({ 'url': url });
	};
};

var noBadge = function(url, title) {
	action = createTab(url);
	chrome.browserAction.setBadgeText({ text: '' });
	chrome.browserAction.setTitle({ title: title });
}

var setErrorBadge = function(err) {
	if (err === 'not-logged-in') {
		noBadge(LOGIN_URL, 'Log in to Memrise');
	}
}

var setBadge = function(group) {
	if (group) {
		var count;

		if (group.harvestable) {
			var path = _.find(group.courses, function(c) {
				return c.harvestPath;
			}).harvestPath;

			var type = 'harvest',
				text = 'H';
		} else if (group.wilting) {
			var path  = group.waterPath,
				type  = 'wilting',
				count = group.wilting,
				text  = group.wilting.toString();
		} else {
			return noBadge(DASHBOARD_URL, 'Go to Memrise dashboard');
		}

		var title = STRINGS[type].replace('%d', count).replace('%s', group.name);
		if (type === 'wilting' && count !== 1) {
			title += 's'
		}

		action = createTab(BASE_URL + path);

		chrome.browserAction.setBadgeBackgroundColor({ color: COLORS[type] });
		chrome.browserAction.setBadgeText({ text: text });
		chrome.browserAction.setTitle({ title: title });
	}
};

var fetchGroups = function(cb) {
	$.get(DASHBOARD_URL, function(html) {
		if (html.search(/'is_authenticated': false/) >= 0) {
			return cb('not-logged-in');
		}

		var $html  = $($.parseHTML(html));
		var groups = [];

		// .whitebox is a single group of courses, like "Animals"
		$('.whitebox', $html).each(function() {
			var group = {
				name: $('.groupname', this).text(),
				wilting: 0,
				courses: []
			};

			var m, href, btn = $('.group-header .btn', this);
			if (href = btn.attr('href')) {
				group.waterPath = href;

				if (m = btn.text().match(/Water (\d+)/)) {
					group.wilting = parseInt(m[1]);
				}
			}

			$('.course-box-wrapper', this).each(function() {
				var course = {
					title: $('a.inner-wrap', this).attr('title'),
					id: parseInt($('.course-progress-box', this).attr('data-course-id'))
				};

				var $harvest = $('.btn[href*="harvest"]', this);
				if ($harvest.length > 0) {
					course.harvestPath = $harvest.attr('href');

					// Make it easier to check which groups have harvestable
					group.harvestable = true;
				}

				group.courses.push(course);
			});

			groups.push(group);
		});

		return cb(null, groups);

		cb(null, topics);
	})
};

var sortGroups = function(a, b) {
	if (a.harvestable) {
		return 1;
	} else if (b.harvestable) {
		return -1;
	}

	if (a.wilting > b.wilting) {
		return 1;
	} else if (b.wilting > a.wilting) {
		return -1;
	}

	return 0;
};

var refreshButton = function(fromOpts) {
	// Clear badge text if refreshing from options
	if (fromOpts) {
		setBadge();
	}

	fetchGroups(function(err, groups) {
		if (err) {
			console.log('err:', err);
			setErrorBadge(err);

			// So that it knows to refresh next time user is at /home/
			if (err === 'not-logged-in') {
				noLogin = true;
			}
		} else {
			setBadge(_.last(groups.sort(sortGroups)));
		}

		// var topicsSetting = settings.get('topics');
		// if (topicsSetting) {
		// 	topics = _.filter(topics, function(topic) {
		// 		return topicsSetting[topic.id] === true;
		// 	});
		// }

	});
};

refreshButton();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch (request) {
		case 'refresh':
			console.log('refreshing');
			var fromOpts = sender.tab.url.indexOf('options.html') > -1;
			refreshButton(fromOpts);
			break;

		case 'home':
			if (noLogin) {
				refreshButton(fromOpts);
			}
			break;
	}
});

setInterval(refreshButton, UPDATE_INTERVAL);
