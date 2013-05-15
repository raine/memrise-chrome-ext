suite('app.Settings', function() {
	test('should be present', function() {
		assert.ok(app.Settings);
	});

	suite('with empty localstorage', function() {
		setup(function() {
			localStorage.clear();
		});

		test('should initialize with default values', function() {
			var settings = new app.Settings();

			for (var key in OPTIONS_DEFAULTS) {
				var value = OPTIONS_DEFAULTS[key];
				assert.equal(settings.get(key), value);
			}
		});

		test('should save the default values to localstorage when initialized', function() {
			assert.lengthOf(localStorage, 0, 'localStorage is empty');
			new app.Settings();
			assert.lengthOf(localStorage, _.keys(OPTIONS_DEFAULTS).length, 'localStorage has as many keys as there are defaults');
		});
	});

	suite('with existing settings in localstorage', function() {
		setup(function() {
			localStorage.clear();
			var s = new app.Settings();
			s.set('wilting-threshold', 10);
		});

		test('should have the existing settings instead of defaults', function() {
			assert.notEqual(OPTIONS_DEFAULTS['wilting-threshold'], 10);
			var s = new app.Settings();
			assert.equal(s.get('wilting-threshold'), 10);
		});

		test('should have the default value that wasn\'t set', function() {
			var s = new app.Settings();
			assert.equal(s.get('track-usage'), OPTIONS_DEFAULTS['track-usage']);
		});
	});

	suite('reset()', function() {
		test('should return settings to defaults', function() {
			var settings = new app.Settings();
			settings.set({
				'wilting-threshold': 10,
				'track-usage': false
			});

			settings.reset();
			for (var key in OPTIONS_DEFAULTS) {
				var value = OPTIONS_DEFAULTS[key];
				assert.equal(settings.get(key), value);
			}
		});
	});
});
