var app = app || {};

app.WhatsNewView = Marionette.ItemView.extend({
	initialize: function() {
		this.on('fetch', this.render);

		this.fetch(function(data) {
			this.data = data;
			this.trigger('fetch');	
		}.bind(this));
	},

	fetch: function(cb) {
		$.get(chrome.extension.getURL("CHANGES.html"), function(data) {
			cb(data);
		});
	},

	render: function() {
		this.$el.html(this.data);
	}
});

app.AppView = Backbone.View.extend({
	el: '#content',

	initialize: function() {
		this.whatsNewView = new app.WhatsNewView();
	},

	render: function() {
		this.whatsNewView.setElement(this.$('.whats-new'));
		return this;
	}
});

$(function() {
	content = new Marionette.Region({
		el: "#content"
	});

	var whatsnew = new app.WhatsNewView();

	content.show(whatsnew);
});
