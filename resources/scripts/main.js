(function ($, _, Backbone, app) {

app.views.ControlContainer = Backbone.View.extend({
	events: {
		'change .data-structure-options': 'setDataStructure',
		'click .execute': 'executeAction'
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
		this.dataStructureModel = new DataStructureModel();
		this.dataStructureModel.initializeExample();
		this.dataStructureView = new DataStructureView({
			el: $('#paper-container')[0],
			model: this.dataStructureModel
		});
		// Update dropdown menus with values specific to chosen data structure
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);
	},
	executeAction: function () {
		var action = this.$el.find('.action-options').val();
		var srcPointerId = this.$el.find('.src-pointer-options').val();
		var dstNodeId = this.$el.find('.dst-node-options').val();
		if (action === 'set') {
			this.dataStructureModel.setPointer(srcPointerId, dstNodeId);
			this.dataStructureView.render();
		}
	}
}, {
	// Options to display in list of available data structures in UI
	structureList: [
		{value: 'LinkedList', label: 'Linked List'}
	]
});

var controlContainerView = new app.views.ControlContainer({
	el: $('#controls')[0]
});

}(jQuery, window._, window.Backbone, window.app));
