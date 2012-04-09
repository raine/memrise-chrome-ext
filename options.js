var JSON_URL = 'http://www.memrise.com/api/1.0/home/?format=json';
var settings = new Store("settings", DEFAULTS);

$(document).ready(function() {
	// Text input logic
	$('input[type=text]')
		.each(function(i, el) {
			var pref = $(this).attr('pref');
			$(this).val(settings.get(pref));
		})
		.blur(function() {
			var val  = $(this).val();
			var pref = $(this).attr('pref');

			// Reset to default if value is invalid
			if (val.length === 0 || parseInt(val).toString() !== val) {
				settings.remove(pref);
				$(this).val(settings.get(pref));
			} else {
				settings.set(pref, val);
			}
		});

	// Topics
	$.get(JSON_URL, function(data) {
		$('#topics .loading').hide();

		if (data.topics && data.topics.length > 0) {
			if (settings.get('topics') == undefined) {
				console.log('topics was empty');
				settings.set('topics', {});
			}

			var topics = settings.get('topics');

			data.topics.forEach(function(topic) {
				var label = $('<label>', {
					text: topic.name
				});

				var checkBox = $('<input>', {
					type: 'checkbox',
					name: topic.slug
				})

				checkBox.change(function() {
					var $box = $(this);
					var slug = $box.attr('name');

					topics[slug] = $box.prop('checked');
					settings.set('topics', topics);
				});

				checkBox.prependTo(label);
				$('#topics .checkboxes').append(label);

				if (!topics.hasOwnProperty(topic.slug) || topics[topic.slug] === true) {
					topics[topic.slug] = true; // Enable by default
					checkBox.prop('checked', true);
				}
			});

			settings.set('topics', topics);
		}
	});

	$('#reset').click(function() {
		Store.clear();
		console.log('localStorage cleared');
	});

	$('#refresh').click(function() {
		chrome.extension.sendRequest('refresh');
	});
});
