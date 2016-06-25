(function ($, _, Backbone, Raphael, app) {

app.views.DataStructure = Backbone.View.extend({
	initialize: function () {
		this.$el.empty();
		this.paper = Raphael(this.el, 800, 300);
		this.render();
	},
	clearCanvas: function () {
		$(this.paper.canvas)
			.children()
			// Don't remove elements used by Raphael
			.not('desc')
			.not('defs')
			.remove();
	}
});

}(jQuery, window._, window.Backbone, window.Raphael, window.app));
