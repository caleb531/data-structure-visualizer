(function ($, _, Backbone, Raphael, app) {

app.views.DataStructure = Backbone.View.extend({
	initialize: function () {
		this.$el.empty();
		this.paper = Raphael(this.el, '100%', 300);
		this.render();
		// Allow user to pan canvas
		this.$el.panzoom({
			disableZoom: false
		});
		var panzoom = this.$el.panzoom('instance');
		panzoom.$elem = this.$el.children('svg');
		panzoom.elem = panzoom.$elem[0];
	},
});

}(jQuery, window._, window.Backbone, window.Raphael, window.app));
