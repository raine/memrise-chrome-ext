var CAVE_URL      = 'http://www.memrise.com/cave/?';
var DASHBOARD_URL = 'http://www.memrise.com/home/';

var COLORS = {
	harvest: [ 250, 177, 31, 255 ],
	wilting: [ 21, 161, 236, 255 ]
};

var STRINGS = {
	harvest: "%s: Harvest %d plant",
	wilting: "%s: Water %d wilting plant"
};

var UPDATE_INTERVAL = 5 * 60 * 1000;
var action;

chrome.browserAction.onClicked.addListener(function() {
	if (action) {
		action();
	}
});

var setBadge = function(topic) {
	if (topic.harvestable > 0) {
		var type   = 'harvest';
		var number = topic.harvestable;
	} else if (topic.wilting > 0) {
		var type   = 'wilting';
		var number = topic.wilting;
	} else {
		action = function() {
			chrome.tabs.create({ 'url': DASHBOARD_URL });
		};

		chrome.browserAction.setBadgeText({ text: '' });
		chrome.browserAction.setTitle({ title: 'Go to Memrise dashboard' });

		return;
	}

	action = function() {
		chrome.tabs.create({ 'url': topic[type + 'URL'] });
	};

	var title = STRINGS[type].replace('%d', number).replace('%s', topic.name);
	if (number !== 1) {
		title += 's'
	}

	chrome.browserAction.setBadgeBackgroundColor({ color: COLORS[type] });
	chrome.browserAction.setBadgeText({ text: number.toString() });
	chrome.browserAction.setTitle({ title: title });
};

var fetchGardens = function(cb) {
	$.get('http://www.memrise.com/home/gardens', function(html) {
		var $html   = $(html);
		var $topics = $html.find('div:has(> .rows.my-wordlists)');
		var topics  = [];

		$topics.each(function() {
			var topic     = {};
			var topicName = $('h3', this).text();
			var topicId   = $(this).attr('id');

			topic.name      = topicName;
			topic.id        = topicId;
			topic.wordlists = [];

			var wordlists = [];

			$('.row', this).each(function() {
				var wordlist = {};
				var wordlistName = $('.details > .name', this).text();

				wordlist.name = wordlistName;
				wordlist.id   = $(this).attr('id');

				var $harvestable = $('.needs_harvest', this);
				if ($harvestable.length) {
					var $a = $harvestable.children('a');
					wordlist.harvestURL   = $a.attr('href');
					wordlist.harvestCount = parseInt($a.text().match(/\((\d+)\)/)[1]);
				}

				var $wilting = $('.wilting', this);
				if ($wilting.length) {
					var $a = $wilting.children('a');
					wordlist.wiltingURL   = $a.attr('href');
					wordlist.wiltingCount = parseInt($a.text().match(/\((\d+)\)/)[1]);
				}

				topic.wordlists.push(wordlist);
			});

			topics.push(topic);
		});

		cb(topics);
	})
};

var sortTopics = function(topics) {
	topics.forEach(function(topic) {
		topic.wilting = topic.wordlists.reduce(function(a, wl) {
			return a + (wl.wiltingCount || 0);
		}, 0);

		topic.harvestable = topic.wordlists.reduce(function(a, wl) {
			return a + (wl.harvestCount || 0);
		}, 0);

		// Construct URLs for harvesting or watering all plants under a topic
		topic.harvestURL = CAVE_URL + jQuery.param({ topic: topic.id, 'plant_filter': 'harvest', ltemplatename: 'all_old_typing' });
		topic.wiltingURL = CAVE_URL + jQuery.param({ topic: topic.id, 'plant_filter': 'wilting', ltemplatename: 'random_old' });
	});

	return topics.sort(function(a, b) {
		if (a.harvestable > b.harvestable) {
			return 1;
		} else if (b.harvestable > a.harvestable) {
			return -1;
		}

		if (a.wilting > b.wilting) {
			return 1;
		} else if (b.wilting > a.wilting) {
			return -1;
		}

		return 0;
	});
};

var refreshButton = function() {
	fetchGardens(function(topics) {
		var topics = sortTopics(topics).reverse();
		var topic  = topics[0];

		setBadge(topic);
	});
};

refreshButton();

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if (request === 'refresh') {
		refreshButton();
	}
});

setTimeout(refreshButton, UPDATE_INTERVAL);
