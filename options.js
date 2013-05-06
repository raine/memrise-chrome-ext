var DASHBOARD_URL = 'http://www.memrise.com/home/';
var settings = new Store("settings", DEFAULTS);
var resetTopics;

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

	$('input[type=checkbox]')
		.each(function(i, el) {
			var pref = $(this).attr('pref');
			$(this).prop('checked', settings.get(pref));
		}).change(function(event) {
			var pref = $(this).attr('pref');
			var val  = $(this).prop('checked');
			settings.set(pref, val);
		});

	// Topics
	get(DASHBOARD_URL, function(html) {
		html = html.replace(/<img\b[^>]*\/>/ig,'');
		$('#topics .loading').hide();

		if (html.search(/'is_authenticated': false/) >= 0) {
			$('#unlogged').show();
			return;
		}

		var $html = $($.parseHTML(html));

		var topics = $.makeArray($('.whitebox .groupname', $html)).map(function(e) {
			return {
				name: e.innerText,
				slug: e.innerText
						.toLowerCase()
						.replace(/[^a-z\s]*/g, '')
						.replace(/\s+/, '-')
			}
		});

		if (topics && topics.length > 0) {
			if (settings.get('topics') == undefined) {
				console.log('topics was empty');
				settings.set('topics', {});
			}

			var store = settings.get('topics');

			resetTopics = function() {
				$('#topics .checkboxes input').prop('checked', true);
				for (slug in store) {
					store[slug] = true;
				}

				settings.set('topics', store);
			}

			topics.forEach(function(topic) {
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

					store[slug] = $box.prop('checked');
					settings.set('topics', store);

					chrome.extension.sendMessage({
						type: 'refresh-from-cache'
					});
				});

				checkBox.prependTo(label);
				$('#topics .checkboxes').append(label);

				if (!store.hasOwnProperty(topic.slug) || store[topic.slug] === true) {
					store[topic.slug] = true; // Enable by default
					checkBox.prop('checked', true);
				}
			});

			settings.set('topics', store);
		}
	});

	$('#reset').click(function() {
		settings.reset();
		$('input[pref]').each(function(i, el) {
			var pref = $(this).attr('pref');
			var val  = settings.get(pref);

			switch(el.type) {
				case 'text':
					$(this).val(val);
					break;
				case 'checkbox':
					$(this).prop('checked', val);
					break;
			}
		});

		resetTopics();
	});

	$('#refresh').click(_.throttle(function() {
		track('Refresh Click in Options');
		chrome.extension.sendMessage({
			type: 'refresh'
		});
	}, 2000));
});

if (document.location.search !== '?installed') {
	track('Options Opened');
}
