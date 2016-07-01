(function () {

app.views.DataStructure = Backbone.View.extend({
	initialize: function () {
		this.$el.empty();
		this.canvas = Raphael(this.el, '100%', 340);
		this.render();
		// Allow user to pan canvas
		this.$el.panzoom({
			disableZoom: true
		});
		this.panzoom = this.$el.panzoom('instance');
		this.panzoom.$elem = this.$el.children('svg');
		this.panzoom.elem = this.panzoom.$elem[0];
	},
	// Recenter canvas translation to 0,0
	recenterCanvas: function () {
		this.panzoom.reset({
			animate: false
		});
	}
});

}());
