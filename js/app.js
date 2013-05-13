var app = angular.module('options', []);


app.controller('TopicsController', function($scope, $http) {
	$http.get('assets/home.html').success(function(data) {
		console.log(data);
	});
});

app.controller('OptionsController', function($scope) {
	// TODO: throttle
	$scope.refresh = function() {
		// track('Refresh Click in Options');
		chrome.extension.sendMessage({
			type: 'refresh'
		});
	}
});

