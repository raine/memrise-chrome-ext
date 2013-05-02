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

var UPDATE_INTERVAL = 5; // Minutes
var noLogin;

var settings = new Store("settings", DEFAULTS);

var consoleHolder = console;
var console = {};

['log', 'info', 'error', 'debug'].forEach(function(e) {
	console[e] = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('[' + (new Date()).toISOString() + ']');
		consoleHolder[e].apply(consoleHolder, args);
	}
});

var openURL = function(url) {
	chrome.tabs.create({ 'url': url });
};

var noBadge = function(url, title) {
	localStorage.actionURL = url;
	chrome.browserAction.setBadgeText({ text: '' });
	chrome.browserAction.setTitle({ title: title });
};

var setErrorBadge = function(err) {
	if (err === 'not-logged-in') {
		noBadge(LOGIN_URL, 'Log in to Memrise');
	}
};

var setBadge = function(group) {
	if (group) {
		var count;

		if (group.harvestable) {
			var path = _.find(group.courses, function(c) {
				return c.harvestPath;
			}).harvestPath;

			var type = 'harvest',
				text = 'H';
		} else if (group.wilting && group.wilting > settings.get('wilting-threshold')) {
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

		localStorage.actionURL = BASE_URL + path;

		chrome.browserAction.setBadgeBackgroundColor({ color: COLORS[type] });
		chrome.browserAction.setBadgeText({ text: text });
		chrome.browserAction.setTitle({ title: title });
	} else {
		return noBadge(DASHBOARD_URL, 'Go to Memrise dashboard')
	}
};

var fetchGroups = function(cb) {
	// Override the dashboard url with local html when in dev env. Simulate delay.
	get(DASHBOARD_URL, function(html) {
		if (html.search(/'is_authenticated': false/) >= 0) {
			return cb('not-logged-in');
		}

		html = html.replace(/<img\b[^>]*\/>/ig,'');
		var $html  = $($.parseHTML(html));
		var groups = [];

		// .whitebox is a single group of courses, like "Animals"
		$('.whitebox', $html).each(function() {
			var group = {
				name: $('.groupname', this).text(),
				wilting: 0,
				courses: []
			};
			
			group.id = group.name // Used in options.js but I'm lazy
				.toLowerCase()
				.replace(/[^a-z\s]*/g, '')
				.replace(/\s+/, '-')

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

		cb(null, groups);
	});
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

var refreshButton = function(opts) {
	console.log('refreshing button', opts);

	if (opts && opts.animate) {
		anim(true);
	}

	fetchGroups(function(err, groups) {
		anim(false);

		if (err) {
			console.log('error fetching data:', err);
			setErrorBadge(err);

			// So that it knows to refresh next time user is at /home/
			if (err === 'not-logged-in') {
				noLogin = true;
			}
		} else {
			var groupsSetting = settings.get('topics');
			if (groupsSetting) {
				groups = _.filter(groups, function(group) {
					return groupsSetting[group.id] === true;
				});
			}

			setBadge(_.last(groups.sort(sortGroups)));
		}
	});
};

// This icon animation code is derived from the Google Mail Checker extension that is
// available as a sample on developer.chrome.com.
// http://developer.chrome.com/extensions/examples/extensions/gmail.zip
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
var animationFrames = 36;
var animationSpeed = 40;
var rotation = 0;
var canvas = document.getElementById('canvas');
var memriseIcon = document.getElementById('memrise');
var canvasContext = canvas.getContext('2d');

var ease = function(t) {
	return t<.5 ? 2*t*t : -1+(4-2*t)*t;
};

var animateFlip = function(cb) {
	rotation += 1/animationFrames;
	drawIconAtRotation();

	if (rotation <= 1) {
		setTimeout(animateFlip.bind(null, cb), animationSpeed);
	} else {
		rotation = 0;
		cb();
	}
};

// anim(true) keeps animating the icon until anim(false) is called
var animState = false;
var anim = function(state) {
	if (state === true) {
		animState = true;
		anim();
	} else if (state === false) {
		animState = false;
	} else {
		animateFlip(function() {
			if (animState) {
				anim();
			}
		});
	}
};

var drawIconAtRotation = function() {
	canvasContext.save();
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.translate(
		Math.ceil(canvas.width/2),
		Math.ceil(canvas.height/2));
	canvasContext.rotate(2*Math.PI*ease(rotation));
	canvasContext.drawImage(memriseIcon,
		-Math.ceil(canvas.width/2),
		-Math.ceil(canvas.height/2));
	canvasContext.restore();
	chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0,
		canvas.width, canvas.height)});
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('request "' + request + '"', sender);

	switch (request) {
		case 'refresh':
			refreshButton({ animate: true });
			break;

		case 'home':
			if (noLogin) {
				refreshButton({ animate: true });
			}
			break;
	}
});

chrome.browserAction.onClicked.addListener(function() {
	track('Button Click');

	var url;
	if (url = localStorage.actionURL) {
		openURL(url);
	}
});

chrome.runtime.onInstalled.addListener(function() {
	track('Extension Installed', { 'version': chrome.app.getDetails().version });

	console.log('installed... refreshing');
	refreshButton({ animate: true });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	console.log('got alarm', alarm);
	refreshButton();
});

if (chrome.runtime && chrome.runtime.onStartup) {
	chrome.runtime.onStartup.addListener(function() {
		console.log('starting browser... refreshing');
		refreshButton({ animate: true });
	});
}

// As an event page, this code is run every time the extension wakes up for
// whatever reason (alarm, opening options etc.) The point here is to make
// sure the alarm set up. Technically it should only be necessary to set up
// an alarm when the extension is installed.
chrome.alarms.get('refresh', function(alarm) {
	if (alarm) {
		console.log('alarm exists', alarm);
	} else {
		console.log("alarm doesn't exist, creating a new alarm");
		chrome.alarms.create('refresh', { periodInMinutes: UPDATE_INTERVAL });
	}
});
