var app = app || {};

(function($) {
	'use strict';

	app.Changes = Marionette.ItemView.extend({
		className: 'news',

		initialize: function() {
			this.on('fetch', this.render);

			this.fetch(function(data) {
				this.data = data;
				this.trigger('fetch');	
			}.bind(this));
		},

		fetch: function(cb) {
			$.get(chrome.extension.getURL('CHANGES.html'), function(data) {
				cb(data);
			});
		},

		render: function() {
			this.$el.html(this.data);
		}
	});
})(jQuery);
