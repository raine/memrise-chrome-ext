var COLORS = {
	harvest: [ 250, 177, 31, 255 ],
	wilting: [ 21, 161, 236, 255 ]
};

var STRINGS = {
	harvest: "%s: Harvest plants",
	wilting: "%s: Water %d wilting plant"
};

var UPDATE_INTERVAL = 15; // Minutes

var anim = new Animation();
var groupsCache;
var unlogged;

var settings = new LocalStore('settings', OPTIONS_DEFAULTS);

var consoleHolder = console;
var console = {};

['log', 'info', 'error', 'debug'].forEach(function(e) {
	console[e] = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift('[' + (new Date()).toISOString() + ']');
		consoleHolder[e].apply(consoleHolder, args);
	};
});

var openURL = function(url, newTab) {
	chrome.tabs[newTab ? 'create' : 'update']({ 'url': url });
};

var getTitle = function(name, count) {
	var title = STRINGS.wilting
		.replace('%s', name)
		.replace('%d', count);

	if (count !== 1) { title += 's'; }
	return title;
};

var updateButton = function(url, text, title, color) {
	if (color) {
		chrome.browserAction.setBadgeBackgroundColor({ color: color });
	}

	chrome.browserAction.setBadgeText({ text: text || '' });
	chrome.browserAction.setTitle({ title: title });

	localStorage.actionURL = url;
};

var setNoBadge = function(url, title) {
	updateButton(url, null, title);
};

var setErrorBadge = function(err) {
	if (err === 'not-logged-in') {
		setNoBadge(Memrise.LOGIN_URL, 'Log in to Memrise');
	}
};

var setButton = function(opts) {
	// If called without arguments; nothing to do
	if (!opts) {
		return setNoBadge(Memrise.DASHBOARD_URL, 'Go to dashboard');
	}

	var obj = opts.obj;
	var count;

	if (opts.type === 'group') {
		count = obj.wilting;
	} else if (opts.type === 'course') {
		count = obj.group.wiltingReduced;
	}

	var text  = count.toString();
	var color = COLORS.wilting;
	var title = getTitle(obj.name, count);
	var url   = Memrise.BASE_URL + obj.waterPath;

	updateButton(url, text, title, color);
};

var fetchGroups = function(cb, opts) {
	opts = opts !== undefined ? opts : {};

	if (groupsCache && opts.cache) {
		return cb(null, groupsCache);
	}

	Memrise.getCategories(function(err, categories) {
		if (err) {
			return cb(err);
		}

		groupsCache = categories;
		cb(null, categories);
	});
};

var processGroups = function(groups) {
	var getMaxByWilting = function(groups) {
		return _.last(_.sortBy(groups, 'wilting'));
	};

	var groupsWL = settings.get('topics');
	if (!groupsWL) {
		return { type: 'group', obj: getMaxByWilting(groups) };
	}

	var enabledGroups = _.filter(groups, function(group) {
		var groupObj = groupsWL[group.slug];
		if (groupObj && groupObj.enabled) {
			return true;
		} else if (groupObj === undefined) {
			return true;
		}
	});

	if (!_.isEmpty(enabledGroups)) {
		return { type: 'group', obj: getMaxByWilting(enabledGroups) };
	}
};

var refreshButton = function(opts) {
	reschedule();

	opts = opts !== undefined ? opts : {};
	console.log('refreshing button', opts);

	if (opts.animate) {
		anim.start();
	}

	fetchGroups(function(err, groups) {
		anim.stop();

		if (err) {
			console.log('error fetching data:', err);
			setErrorBadge(err);

			if (err === 'not-logged-in') {
				unlogged = true;
				anim.doNext(function() {
					anim.drawIcon('unlogged');
				});
			}
		} else {
			if (unlogged) {
				unlogged = false;
				anim.doNext(function() {
					anim.drawIcon('logged');
				});
			}

			// processGroups returns instructions for setButton
			var thing = processGroups(groups);
			if (thing) {
				var wilting = thing.type === 'course' ?
					thing.obj.group.wiltingReduced : thing.obj.wilting;

				if (wilting < settings.get('wilting-threshold')) {
					return setButton();
				}
			}

			setButton(thing);
		}
	}, opts);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('request "' + request.type + '"', sender);

	var methods = {
		'refresh': function() {
			refreshButton({ animate: true });
		},
		'refresh-from-cache': function() {
			refreshButton({ cache: true });
		},
		'home': function() {
			if (unlogged) {
				refreshButton({ animate: true });
			}
		}
	};

	methods[request.type]();
});

chrome.browserAction.onClicked.addListener(function() {
	track('Button Click');

	var url;
	if (url = localStorage.actionURL) {
		openURL(url);
	}
});

chrome.runtime.onInstalled.addListener(function() {
	// Make sure the super properties are set in the events that are sent
	// before going to the options for the first time
	mixpanel.register({
		'Version': chrome.app.getDetails().version
	});

	track('Extension Installed', {
		'version': chrome.app.getDetails().version,
		'update': !!localStorage.firstInstalled
	});

	console.log('installed... refreshing');
	refreshButton({ animate: true });

	if (!localStorage.firstInstalled) {
		localStorage.firstInstalled = Date.now();
		openURL('options/index.html?installed', true);
	}

	localStorage.lastInstalled = Date.now();
	localStorage.lastVersion   = chrome.app.getDetails().version;
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

function reschedule() {
	chrome.alarms.create('refresh', { periodInMinutes: UPDATE_INTERVAL });
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
		reschedule();
	}
});
