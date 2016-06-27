(function ($, _, Backbone, Raphael, app) {

app.views.DataStructure = Backbone.View.extend({
	initialize: function () {
		this.$el.empty();
		this.paper = Raphael(this.el, 800, 300);
		this.render();
	},
});

}(jQuery, window._, window.Backbone, window.Raphael, window.app));
