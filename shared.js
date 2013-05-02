var DEV_ENV  = (chrome.app.getDetails().version === '0.0.1')
var DEFAULTS = {
	"wilting-threshold": 1,
	"track-usage": true
};

var get = function(url, callback) {
	var cb;
	if (DEV_ENV) {
		url = chrome.extension.getURL('/assets/home.html');
		cb = function() {
			var args = arguments;
			setTimeout(function() {
				callback.apply(null, args);
			}, 2000);
		}
	}

	$.get(url, cb || callback);
};
