var observer = new window.WebKitMutationObserver(function(mutations, observer) {
	for (var i = mutations.length - 1; i >= 0; i--){
		var m = mutations[i];

		for (var j = m.addedNodes.length - 1; j >= 0; j--){
			var node = m.addedNodes[j];
			if (node.className && node.className.indexOf('end_of_session') > -1) {
				setTimeout(function() {
					chrome.runtime.sendMessage({
						type: 'refresh'
					});
				}, 1000);
				break;
			}
		}
	}
});

var gardeningArea = document.getElementById('gardening-area');
if (gardeningArea) {
	observer.observe(gardeningArea, {
		subtree: true,
		attributes: true,
		childList: true
	});
}

if (document.location.pathname === '/home/') {
	chrome.runtime.sendMessage({
		type: 'home'
	});
}

if (document.location.pathname.match(/\/grow\/$/)) {
	var courseId = document.location.pathname.match(/\/course\/(\d+)\//)[1];
	chrome.storage.local.set({ lastPlantedCourse: +courseId });
}

if (gardeningArea) {
	var idleTimer = document.createElement('script');
	idleTimer.src = chrome.extension.getURL('lib/idle-timer.min.js');
	idleTimer.onload = function() {
		var actualCode = '(' + function() {
			var IDLE_TIMEOUT = 15000;
			var s = MEMRISE.garden.stats;
			var idleTime = 0;
			var startTime = new Date();
			var idleStart;

			var msg = function(obj) {
				window.postMessage({
					type: 'FROM_GARDEN',
					text: JSON.stringify(obj)
				}, '*');
			};

			$(document).idleTimer(IDLE_TIMEOUT);

			$(document).on('idle.idleTimer', function() {
				idleStart = new Date();
			});

			$(document).on('active.idleTimer', function() {
				if (idleStart) {
					var timeSpentIdle = new Date() - idleStart;
					idleTime += timeSpentIdle;
				}
			});

			var sendStats = function() {
				var state = $(document).data('idleTimer');
				if (state === 'active') {
					// The time spent on the page as active
					var realTime = (new Date() - startTime) - idleTime;

					if (s.num_incorrect === 0 && s.num_correct === 0)
						return;

					var obj = {
						current_streak      : s.current_streak,
						longest_streak      : s.longest_streak,
						num_correct         : s.num_correct,
						num_incorrect       : s.num_incorrect,
						num_things_seen     : s.num_things_seen,
						percent_correct     : s.percent_correct,
						total_points_earned : s.total_points_earned,
						real_time_spent     : realTime,
						start_time          : startTime.getTime()
					};

					msg(obj);
				}
			};

			window.addEventListener('beforeunload', sendStats, false);
		} + ')();';

		var script = document.createElement('script');
		script.textContent = actualCode;
		(document.head||document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	};

	(document.head || document.documentElement).appendChild(idleTimer);

	chrome.storage.local.get('sessions', function(obj) {
		var sessions = obj.sessions || [];

		window.addEventListener('message', function(event) {
			if (event.source != window)
				return;

			if (event.data.type && (event.data.type == 'FROM_GARDEN')) {
				var data = JSON.parse(event.data.text);
				sessions.push(data);
				chrome.storage.local.set({ 'sessions': sessions });
			}
		}, false);
	});
}
