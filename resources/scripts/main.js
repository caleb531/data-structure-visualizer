(function () {

// The controller view which watches for interaction with UI controls and
// updates models/views according to values changed
app.views.Controller = Backbone.View.extend({
	constants: {
		LOCAL_STORAGE_KEY: 'data-structure-visualizer',
		MAX_SAVED_STATES: 100
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

		//is there a saved app state in local storage?
		var savedAppStateJson = localStorage.getItem(this.constants.LOCAL_STORAGE_KEY);

		if(savedAppStateJson == null || savedAppStateJson === undefined) {
			this.setDefaultDataStructure();
			this.stateStack = [];
		}
		else {
			this.restoreAppState(savedAppStateJson);
		}
	},
	setDefaultDataStructure: function () {
		var dataStructureName = this.$el.find('.data-structure-options').val();
		// Variables pointing to constructors
		var DataStructureModel = app.models[dataStructureName];
		var DataStructureView = app.views[dataStructureName];
		// Variables pointing to instances of the above constructors
		this.dataStructureModel = new DataStructureModel();
		this.dataStructureModel.reset();
		this.dataStructureView = new DataStructureView({
			el: $('#canvas-container')[0],
			model: this.dataStructureModel
		});

		// Update dropdown menus with values specific to chosen data structure
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);
	},
	restoreAppState: function(savedAppStateJson) {
		var savedAppState = JSON.parse(savedAppStateJson);

		// Variables pointing to constructors
		var DataStructureModel = app.models[savedAppState.menu.structureName];
		var DataStructureView = app.views[savedAppState.menu.structureName];
		// Variables pointing to instances of the above constructors
		this.dataStructureModel = new DataStructureModel();

		this.dataStructureModel.setState(savedAppState.currentStructureState);

		this.dataStructureView = new DataStructureView({
			el: $('#canvas-container')[0],
			model: this.dataStructureModel
		});

		// Update dropdown menus with values specific to chosen data structure
		this.setMenuOptions('.src-pointer-options', DataStructureView.srcPointerOptions);
		this.setMenuOptions('.dst-node-options', DataStructureView.dstNodeOptions);

		//restore a reasonable number of states to this state stack
		this.stateStack = this.lastN(savedAppState.structureStateStack, this.constants.MAX_SAVED_STATES);

		//restore the menu
		this.$el.find('.src-pointer-options').val(savedAppState.menu.srcPointer.val);
		this.$el.find('.dst-node-options').val(savedAppState.menu.dstNode.val);
		this.$el.find('.action-options').val(savedAppState.menu.actionOptionsVal);
		this.$el.find('.data-structure-options').val(savedAppState.menu.structureName);

		if (savedAppState.menu.srcPointer.disabled) {
			this.$el.find('.src-pointer-options').prop('disabled', true);
		}

		this.dataStructureView.render();

	 },
	 //where n is 1 based
	 lastN: function(array, n) {
	 	if (array.length <= n) {
			return array;
		}
		else {
			var index = array.length - n;
			var items = [];

			while(index <= n) {
				if(array[index] == null || array[index] === undefined)
					continue;
				items.push(array[index]);
				index = index + 1;
			}

			return items;
		}
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
	changeAction: function () {
		// Disable source pointer dropdown if delete is selected
		var action = this.$el.find('.action-options').val();
		this.$el
			.find('.src-pointer-options')
			.prop('disabled', (action === 'delete'));

		this.saveSessionToLocalStorage(this.dataStructureModel.getState());
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
		var appState = {
			currentStructureState: state,
			structureStateStack: this.lastN(this.stateStack, this.constants.MAX_SAVED_STATES),
			menu: {
				srcPointer: {
					val: this.$el.find('.src-pointer-options').val(),
					disabled: this.$el.find('.src-pointer-options').prop('disabled')
				},
				dstNode: {
					val: this.$el.find('.dst-node-options').val()
				},
				actionOptionsVal: this.$el.find('.action-options').val(),
				structureName: this.$el.find('.data-structure-options').val()
			}
		};

		localStorage.setItem(this.constants.LOCAL_STORAGE_KEY, JSON.stringify(appState));
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
