(function () {

// The controller view which watches for interaction with UI controls and
// updates models/views according to values changed
app.views.Controller = Backbone.View.extend({
	constants: {
		STRUCTURES_STATE: 'STRUCTURES_STATE',
		STATE_STACK: 'STATE_STACK'
	},
	events: {
		'change .data-structure-options': 'setDataStructure',
		'click .execute': 'executeAction',
		'click .reset': 'resetStructure',
		'change .action-options': 'changeAction',
		'click .undo': 'undoAction',
		'click .recenter': 'recenterCanvas'
	},
	initialize: function () {
		this.setMenuOptions('.data-structure-options',
			app.views.Controller.structureList);
		this.setDataStructure();
		// stateStack saves the state of the data structure at each step
		this.setStateStack();
	},
	setStateStack: function() {
		this.stateStack = [];
		var jsonifiedStateStack = localStorage.getItem(this.constants.STATE_STACK);

		if(jsonifiedStateStack !== null) {
			this.stateStack = JSON.parse(jsonifiedStateStack);
		}
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

		this.initializeDataStructure();

		this.dataStructureView = new DataStructureView({
			el: $('#canvas-container')[0],
			model: this.dataStructureModel
		});

		// Update dropdown menus with values specific to chosen data structure
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);
	},

	//try to restore a saved state, else, set the data structure model to
	//its default settings.
	initializeDataStructure: function() {
		var jsonifiedState = localStorage.getItem(this.constants.STRUCTURES_STATE);

		if(jsonifiedState !== null) {
			this.dataStructureModel.setState(JSON.parse(jsonifiedState));
		}
		else {
			this.dataStructureModel.reset();
		}
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
				this.saveSessionToLocalStorage(this.dataStructureModel.getState());
			}
		} else if (action === 'delete') {
			this.dataStructureModel.deleteNode(dstNodeId);
			this.dataStructureView.render();
			this.saveSessionToLocalStorage(this.dataStructureModel.getState());
		}
	},
	undoAction: function () {
		var state = this.stateStack.pop();
		if (state) {
			this.dataStructureModel.setState(state);
			this.dataStructureView.render();
			this.saveSessionToLocalStorage(state);
		} else {
			alert('Nothing more to undo!');
		}
	},
	// Recenter canvas translation
	recenterCanvas: function () {
		this.dataStructureView.recenterCanvas();
	},
	resetStructure: function() {
		this.dataStructureModel.reset();
		this.dataStructureView.render();
		this.saveSessionToLocalStorage(this.dataStructureModel.getState());
	},
	//Saves the given state to the user's machine. This in part enables the state
	//of the structure before viewing the instructions to be the same as the state
	//after viewing the instructions.
	saveSessionToLocalStorage: function(state) {
		localStorage.setItem(this.constants.STRUCTURES_STATE, JSON.stringify(state));
		localStorage.setItem(this.constants.STATE_STACK, JSON.stringify(this.stateStack));
	}
}, {
	// Options to display in list of available data structures in UI
	structureList: [
		{value: 'LinkedList', label: 'Linked List'}
	]
});

var controllerView = new app.views.Controller({
	el: $('#controls')[0]
});

}());
