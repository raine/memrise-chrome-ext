var settings = new Store("settings", DEFAULTS);

$(document).ready(function() {
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
});
