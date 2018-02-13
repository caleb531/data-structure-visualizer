(function () {

// The parent view from which all data structure views MUST inherit; this view
// must remain accessible under the global app.views object so that child views
// can access it
app.views.DataStructure = Backbone.View.extend({
	// Initialize the view (this function is automatically called by Backbone
	// when a new child view is instantiated)
	initialize: function () {
		this.$el.empty();
		this.canvas = Raphael(this.el, '100%', 340);
		// Allow user to pan canvas via user interaction on the container
		this.$el.panzoom({
			disableZoom: true,
			$set: this.$el.children('svg')
		});
		this.panzoom = this.$el.panzoom('instance');
	},
	// Center the inner canvas within the outer container (where the data
	// structure will always be visible)
	recenterCanvas: function () {
		this.panzoom.reset({
			animate: false
		});
	}
});

}());
