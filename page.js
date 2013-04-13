var observer = new window.WebKitMutationObserver(function(mutations, observer) {
	for (var i = mutations.length - 1; i >= 0; i--){
		var m = mutations[i];

		for (var j = m.addedNodes.length - 1; j >= 0; j--){
			var node = m.addedNodes[j];
			if (node.className && node.className.indexOf('end_of_session') > -1) {
				chrome.runtime.sendMessage('refresh');
			}
		};
	};
});

var gardeningArea = document.getElementById('gardening-area');
if (gardeningArea) {
	observer.observe(gardeningArea, {
		subtree: true,
		attributes: true,
		childList: true
	});
}
