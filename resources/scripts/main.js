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
		var dataStructureName = this.$el.find('.data-structure-options').val();
		// Variables pointing to constructors
		var DataStructureModel = app.models[dataStructureName];
		var DataStructureView = app.views[dataStructureName];
		// Variables pointing to instances of the above constructors
		var dataStructureModel = new DataStructureModel();
		dataStructureModel.initializeExample();
		var dataStructureView = new DataStructureView({
			el: $('#paper-container')[0],
			model: dataStructureModel
		});
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);
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
