(function ($, _, Backbone, app) {

app.views.ControlContainer = Backbone.View.extend({
	events: {
		'change .data-structure-options': 'setDataStructure'
	},
	initialize: function () {
		this.setMenuOptions('.data-structure-options',
			app.views.ControlContainer.structureList);
		this.setDataStructure();
	},
	setMenuOptions: function (menuSelector, menuOptions) {
		var $menu = this.$el.find(menuSelector);
		$menu.empty();
		for (var o = 0; o < menuOptions.length; o += 1) {
			$('<option>')
				.prop({value: menuOptions[o].value})
				.html(menuOptions[o].label)
				.appendTo($menu);
		}
	},
	setDataStructure: function () {
		var structureName = this.$el.find('.data-structure-options').val();
		// Variables pointing to constructors
		var StructureModel = app.models[structureName];
		var StructureView = app.views[structureName];
		// Variables pointing to instances of the above constructors
		var structureModel = new StructureModel();
		structureModel.initializeExample();
		var structureView = new StructureView({
			el: $('#paper-container')[0],
			model: structureModel
		});
		this.setMenuOptions('.src-pointer-options', StructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', StructureView.dstNodeOptions);
	}
}, {
	structureList: [
		{value: 'LinkedList', label: 'Linked List'}
	]
});

var controlContainerView = new app.views.ControlContainer({
	el: $('#controls')
});

}(jQuery, window._, window.Backbone, window.app));
