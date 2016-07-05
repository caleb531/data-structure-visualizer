(function () {

app.views.ControlContainer = Backbone.View.extend({
	events: {
		'change .data-structure-options': 'setDataStructure',
		'click .execute': 'executeAction',
		'change .action-options': 'changeAction',
		'click .undo': 'undoAction',
		'click .recenter': 'recenterCanvas'
	},
	initialize: function () {
		this.setMenuOptions('.data-structure-options',
			app.views.ControlContainer.structureList);
		this.setDataStructure();
		// stateStack saves the state of the data structure at each step
		this.stateStack = [];
	},
	setMenuOptions: function (menuSelector, menuOptions) {
		var $menu = this.$el.find(menuSelector);
		$menu.empty();
		menuOptions.forEach(function (menuOption) {
			$('<option>')
				.prop({value: menuOption.value})
				.html(menuOption.label)
				.appendTo($menu);
		});
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
			el: $('#canvas-container')[0],
			model: this.dataStructureModel
		});
		// Update dropdown menus with values specific to chosen data structure
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);
	},
	changeAction: function () {
		// Disable source pointer dropdown if delete is selected
		var action = this.$el.find('.action-options').val();
		this.$el
			.find('.src-pointer-options')
			.prop('disabled', (action === 'delete'));
	},
	executeAction: function () {
		var action = this.$el.find('.action-options').val();
		var srcPointerId = this.$el.find('.src-pointer-options').val();
		var dstNodeId = this.$el.find('.dst-node-options').val();
		this.stateStack.push(this.dataStructureModel.getState());
		if (action === 'set') {
			var status = this.dataStructureModel.setPointer(srcPointerId, dstNodeId);
			// Undo when model reaches impossible state
			if (status === 'undo') {
				this.undoAction();
			} else {
				this.dataStructureView.render();
			}
		} else if (action === 'delete') {
			this.dataStructureModel.deleteNode(dstNodeId);
			this.dataStructureView.render();
		}
	},
	undoAction: function () {
		var state = this.stateStack.pop();
		if (state) {
			this.dataStructureModel.setState(state);
			this.dataStructureView.render();
		} else {
			alert('Nothing more to undo!');
		}
	},
	// Recenter canvas translation
	recenterCanvas: function () {
		this.dataStructureView.recenterCanvas();
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

}());
