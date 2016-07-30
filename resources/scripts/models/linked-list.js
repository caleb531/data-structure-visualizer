(function () {

// The model representing a node in a linked list
app.models.LinkedListNode = Backbone.Model.extend({
	defaults: {
		// A reference to the next node in the containing list
		next: null,
		// The numeric element value of the node
		elem: null,
		// Indicates if the node was deleted/freed
		freed: false
	},
	// Indicate that the 'elem' property will be used to uniquely identify a
	// particular node (compared to other nodes in the below NodeCollection)
	idAttribute: 'elem',
	initiailize: function (elem) {
		this.set('elem', elem);
	}
});

// The collection for creating an ordered sequence to store linked list nodes
var NodeCollection = Backbone.Collection.extend({
	model: app.models.LinkedListNode
});

// The model used to create and manipulate a linked list structure; this model
// MUST be accessible under the global app.models object with a name that
// matches the corresponding 'value' in the main controller's structureList
app.models.LinkedList = Backbone.Model.extend({
	defaults: {
		// A reference to the front first node in the list
		front: null,
		// A reference to the last node in the list
		rear: null,
		// References to arbitrary nodes used for iteration and list operations
		// like deleting the ith node
		t: null,
		p: null,
		// A counter used to free up the elem values of freed nodes so that they
		// can be used by newly-allocated nodes; when a node is freed, the
		// curent value of the counter is used as the freed node's new elem
		// value, after which the counter is decremented for the next freed node
		// to use
		freedNodeElemCounter: -1
	},
	// Initialize the model (this is automatically called by Backbone whenever
	// the model is instantiated)
	initialize: function () {
		// Store a collection of all nodes that are or used to be apart of the
		// list (including nodes reachable from Front, as well as those that are
		// not)
		this.set('nodes', new NodeCollection());
	},

	// Simulate a segmentation fault by alerting the user
	triggerSegfault: function () {
		alert('Segmentation fault!');
	},

	// REQUIRED: Manipulate the list by setting the pointers with the given IDs
	// (e.g. "p" and "p-next", respectively); this function is called by the
	// main controller
	setPointer: function (srcPointerId, dstPointerId) {

		if (srcPointerId === dstPointerId) {
			return;
		}

		var dstNode = this.getDstNode(dstPointerId);

		if (dstNode !== null && dstNode.get('freed') === true) {
			// Trigger segfault if dstNode is actually freed memory
			this.triggerSegfault();
			return;
		} else if (dstPointerId.indexOf('-next') !== -1) {
			// Trigger segfault if setting "Next" of NULL or freed memory
			var origPointer = this.getDstNode(
				dstPointerId.replace('-next', ''));
			if (origPointer === null || origPointer.get('freed') === true) {
				this.triggerSegfault();
				return;
			}
		}

		if (srcPointerId.indexOf('-next') !== -1) {
			// If source pointer ID is "*-next", set the actual "next" pointer
			// for * appropriately
			var node = this.get(srcPointerId.replace('-next', ''));
			if (node) {
				node.set('next', dstNode);
			} else {
				// If that *-next pointer doesn't point to anything, it must be
				// freed memory; this should trigger a segfault
				this.triggerSegfault();
				return;
			}
		} else {
			// Otherwise, set the pointer normally
			this.set(srcPointerId, dstNode);
		}

		// If this operation just created a cycle
		if (this.cycleDetected()) {
			alert('You just created a cycle. Undoing...');
			// Tell the main controller to undo the cycle-creating operation
			return 'undo';
		}
	},


	// Retrieve the destination node (i.e. the rvalue) from the given
	// destination pointer ID (e.g. "p", "p-next", "null", "new-node", etc.)
	getDstNode: function(dstPointerId) {

		if (dstPointerId === 'null') {
			return null;
		} else if (dstPointerId === 'new-node') {
			var newNode = new app.models.LinkedListNode({
				//elem: prompt('Enter a new value for this node')
				elem: this.getNewElemValue()
			});

			this.get('nodes').add(newNode);
			return newNode;

		} else {
			// Handle case where Front, Rear, P, or *->Next is set as dst
			if (dstPointerId.indexOf('-next') !== -1) {
				var node = this.get(dstPointerId.replace('-next', ''));
				if (node) {
					return node.get('next');
				} else {
					return null;
				}
			} else {
				return this.get(dstPointerId);
			}
		}

	},

	// Prompt the user for an element value to use for instantiating a new node
	getNewElemValue: function() {
		var stop = false;
		var promptMessage = 'Please enter a value for this new node';
		var value = 1;

		while (!stop) {
			value = prompt(promptMessage);

			if (value === null) {
				// Prevent user from cancelling prompt; we need a value to
				// return
				promptMessage = 'Please enter a value before continuing';
			} else if (value.match(/^[1-9][0-9]*$/i) === null) {
				// Require a positive integer value
				promptMessage = 'Please enter a positive integer value';
			} else if (!this.elemValueIsUnique(value)) {
				// Require a value that is not used by another node
				promptMessage = 'Please enter a value that is not already used by another node';
			} else {
				// Otherwise, assume value is valid at this point
				return parseInt(value);
			}

		}

		return value;
	},

	// Return true if the given element value is not used by an existing node in
	// the list; otherwise, return false
	elemValueIsUnique: function(value) {
		return (this.get('nodes').get(parseInt(value)) === undefined);
	},

	// Return true if the list has a cycle; otherwise, return false
	cycleDetected: function() {
		// Keep track of nodes we encounter while traversing the list (this
		// assumes that element values are unique)
		var nodesWeHaveSeen = {};
		var currentNode = this.get('front');

		while (currentNode !== null) {
			// If we encounter the same node twice, the list has a cycle
			if (nodesWeHaveSeen.hasOwnProperty(currentNode.get('elem'))) {
				return true;
			}
			// Otherwise, mark the node as "seen" and move on
			nodesWeHaveSeen[currentNode.get('elem')] = true;
			currentNode = currentNode.get('next');
		}

		return false;
	},

	// REQUIRED: deletes/frees/deallocates a node identified by the given
	// dstPointerId (e.g. "rear", "p", "p-next", etc.)
	deletePointer: function(dstPointerId) {
		if (dstPointerId === 'null') {
			alert('Cannot delete NULL');
			return;
		}

		var dstNode = this.getDstNode(dstPointerId);

		// Trigger segfault if user attempts to free already-free memory
		if (dstNode.get('freed') === true) {
			this.triggerSegfault();
			return;
		}

		dstNode.set('next', null);
		dstNode.set('freed', true);
		dstNode.set('elem', this.get('freedNodeElemCounter'));

		// create the new value for the next deleted node
		this.set('freedNodeElemCounter', this.get('freedNodeElemCounter') - 1);
	},

	// Iterate through all nodes reachable from the Front node, calling the
	// given function for each iteration; this function receives several
	// arguments as indicated below
	forEachReachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var p = this.get('p');
		var t = this.get('t');
		var currentNode = front;

		while (currentNode !== null) {
			callback(currentNode, front, rear, p, t);
			currentNode = currentNode.get('next');
		}
	},

	// Iterate through all nodes which cannot be reached from Front by following
	// the pointer chain, calling the given function for each iteration
	forEachUnreachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var p = this.get('p');
		var t = this.get('t');
		var currentNode = front;
		// Keep track of nodes we have seen
		var seenNodes = {};

		// Iterate through the entire list once by following the pointer chain
		// from Front; any nodes we encounter along the way are reachable
		while (currentNode !== null) {
			seenNodes[currentNode.get('elem')] = true;
			currentNode = currentNode.get('next');
		}

		var index = 0;

		// Iterate through the list again; any nodes that we have not already encountered are considered "unreachable"
		while (index < this.get('nodes').length) {
			currentNode = this.get('nodes').at(index);

			if (!seenNodes.hasOwnProperty(currentNode.get('elem')) && currentNode.get('freed') === false) {
				callback(currentNode, front, rear, p, t);
			}

			index = index + 1;
		}
	},

	// Return the ID of the given node (or null if node is null)
	getNodeElem: function (node) {
		if (node === null) {
			return null;
		} else {
			return node.get('elem');
		}
	},

	// REQUIRED: Return a valid JSON object representing the state of the list;
	// this function enables the main controller to save the state of the list
	// to the history
	getState: function () {
		var state = {
			front: this.getNodeElem(this.get('front')),
			rear: this.getNodeElem(this.get('rear')),
			p: this.getNodeElem(this.get('p')),
			t: this.getNodeElem(this.get('t')),
			nodes: []
		};
		var nodes = this.get('nodes');
		var model = this;
		nodes.forEach(function (node) {
			state.nodes.push({
				elem: node.get('elem'),
				// Convert node references to the numeric values of those
				// respective nodes (to avoid duplicate node definitions in the
				// serialized JSON)
				next: model.getNodeElem(node.get('next')),
				freed: node.get('freed')
			});
		});
		return state;
	},

	// REQUIRED: Update the model to reflect the given JSON state object; this
	// function is used by the main controller to undo operations and persist
	// the state of the linked list across page loads
	setState: function (state) {
		var nodes = this.get('nodes');
		// Empty the node collection before pushing new nodes
		nodes.reset([]);
		var model = this;
		// Initially add all nodes with their IDs and element values
		state.nodes.forEach(function (nodeState) {
			var node = new app.models.LinkedListNode({
				elem: nodeState.elem,
				// Use ID of next node; convert to pointer in next loop
				next: nodeState.next,
				freed: nodeState.freed
			});
			if (nodeState.elem === state.front) {
				model.set('front', node);
			}
			if (nodeState.elem === state.rear) {
				model.set('rear', node);
			}
			if (nodeState.elem === state.p) {
				model.set('p', node);
			}
			if (nodeState.elem === state.t) {
				model.set('t', node);
			}
			nodes.add(node);
		});
		// Now that all nodes exist, convert next IDs to next pointers
		nodes.forEach(function (node) {
			var nextElem = node.get('next');
			if (nextElem !== null) {
				node.set('next', nodes.get(nextElem));
			}
		});

	},

	// REQUIRED: Reset the list model to a default example list
	reset: function () {
		this.setState({
			front: 24,
			rear: 99,
			p: 24,
			t: 24,
			nodes: [
				{
					elem: 24,
					next: 42
				},
				{
					elem: 42,
					next: 99
				},
				{
					elem: 99,
					next: null
				}
			]
		});

	}
});

}());
