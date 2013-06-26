var COLORS = {
	wilting: [ 21, 161, 236, 255 ]
};

var STRINGS = {
	wilting : "%s: Water %d wilting plant",
	notifications: {
		wilting: {
			title : "%s: Ready to water",
			text  : "Click to water %d plant"
		}
	}
};

var UPDATE_INTERVAL = 10; // Minutes

var anim = new Animation();
var groupsCache;
var unlogged;
var isBadgeBlank;

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

var Notification = {
	build: function(url, title, text, icon, trackArgs) {
		var notification = webkitNotifications.createNotification(icon, title, text);
		if (url) {
			notification.addEventListener('click', function() {
				if (trackArgs) track.apply(null, trackArgs);
				openURL(url, true);
			});
		}

		return notification;
	},

	wilting: function(opts) {
		var obj   = opts.obj; // Group or course
		var url   = Memrise.BASE_URL + obj.waterPath;
		var title = STRINGS.notifications.wilting.title.replace('%s', obj.name);
		var text  = STRINGS.notifications.wilting.text.replace('%d', obj.wilting);
		var icon  = obj.photo;
		var trackArgs = [ 'Notification Click', { 'Wilting': obj.wilting } ];
		if (obj.wilting !== 1) text += 's';
		this.build(url, title, text, icon, trackArgs).show();
	},

	update: function(version) {
		var args = [
			'options/index.html#changes',
			'Extension Updated',
			"See what's new in " + version,
			'icons/icon48.png',
			[ 'Update Notification Click' ]
		];

		Notification.build.apply(this, args).show();
	}
};

var openURL = function(url, newTab, curTab) {
	if (newTab || !curTab) {
		return chrome.tabs.create({ 'url': url });
	}

	var matchers = [
		"/home",
		"/course/.*",
		"/garden/.*"
	];

	var onMemrise;
	if (curTab.url.indexOf(Memrise.BASE_URL) === 0) {
		onMemrise = _.any(matchers, function(m) {
			return new RegExp(m).test(curTab.url);
		});
	}

	var method = (onMemrise ? 'update' : 'create');
	chrome.tabs[method]({ 'url': url });
};

var getTitle = function(name, count) {
	var title = STRINGS.wilting
		.replace('%s', name)
		.replace('%d', count);

	if (count !== 1) title += 's';
	return title;
};

var updateButton = function(url, text, title, color) {
	isBadgeBlank = text ? false : true;

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
		var maxGroup = getMaxByWilting(enabledGroups);
		if (maxGroup.wilting > 0) {
			return { type: 'group', obj: maxGroup };
		}
	}
};

var refreshButton = function(opts) {
	opts = opts !== undefined ? opts : {};
	reschedule();
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

			var blankBadge = isBadgeBlank;
			setButton(thing);

			// Notification should only be shown as a result from an alarm
			// and if there is currently no badge
			if (thing && opts.alarm && blankBadge && settings.get('notifications')) {
				Notification.wilting(thing);
			}
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
		},
		'test-notification': function() {
			if (groupsCache) {
				var thing = processGroups(groupsCache);
				if (thing) return Notification.wilting(thing);
			}

			Notification.build(
				null,
				STRINGS.notifications.wilting.title.replace('%s', 'English'),
				STRINGS.notifications.wilting.text.replace('%d', '123') + 's',
				'http://static.memrise.com.s3.amazonaws.com/uploads/language_photos/Flags_EnglandUSA.png'
			).show();
		}
	};

	methods[request.type]();
});

chrome.browserAction.onClicked.addListener(function(tab) {
	track('Button Click');

	var url;
	if (url = localStorage.actionURL) {
		openURL(url, false, tab);
	}
});

chrome.runtime.onInstalled.addListener(function() {
	var isUpdate = !!localStorage.firstInstalled;
	var version  = chrome.app.getDetails().version;
	var now      = Date.now();

	// Make sure the super properties are set in the events that are sent
	// before going to the options for the first time
	mixpanel.register({
		'Version': version
	});

	track('Extension Installed', {
		'version' : version,
		'update'  : isUpdate
	});

	console.log('installed... refreshing');
	refreshButton({ animate: true });

	if (!isUpdate) {
		localStorage.firstInstalled = now;
		openURL('options/index.html?installed', true);
	}

	// lastInstalled could possibly be used here but I have doubts about
	// relying on Date.now() with static timestamps like LAST_UPDATE = 1370395171790
	if (isUpdate) {
		// Should be changed when notification is needed for an update
		var NOTIF_UPDATE = '2.0.4';

		if (localStorage.notifUpdate !== NOTIF_UPDATE) {
			Notification.update(version);
			localStorage.notifUpdate = NOTIF_UPDATE;
		}
	}

	localStorage.lastInstalled = now;
	localStorage.lastVersion   = chrome.app.getDetails().version;
});

chrome.alarms.onAlarm.addListener(function(alarm) {
	console.log('got alarm', alarm);
	refreshButton({ alarm: true });
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

chrome.commands.onCommand.addListener(function(command) {
	chrome.storage.local.get('lastPlantedCourse', function(obj) {
		openURL(Memrise.BASE_URL + "/course/next/" + obj.lastPlantedCourse);
	});
});
