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
	idAttribute: 'elem',
	initiailize: function (elem) {
		this.set('elem', elem);
	}
});

// The collection for creating an ordered sequence to store linked list nodes
var NodeCollection = Backbone.Collection.extend({
	model: app.models.LinkedListNode,
});

// The model used to create and manipulate a linked list structure
app.models.LinkedList = Backbone.Model.extend({
	defaults: {
		front: null,
		rear: null,
		t: null,
		p: null
	},
	initialize: function () {
		// Store a collection of all nodes that are or used to be apart of the
		// list (including nodes reachable from Front, as well as those that are
		// not)
		this.set('nodes', new NodeCollection());
	},

	// Trigger a segmentation fault by alerting the user
	triggerSegfault: function () {
		alert('Segmentation fault!');
	},

	setPointer: function (srcPointerId, dstNodeId) {

		if (srcPointerId === dstNodeId) {
			return;
		}

		var dstNode = this.getDstNode(dstNodeId);

		// Check for segmentation faults
		if (dstNode !== null && dstNode.get('freed') === true) {
			this.triggerSegfault();
			return;
		}

		if (srcPointerId.indexOf('-next') !== -1) {
			var node = this.get(srcPointerId.replace('-next', ''));
			if (node) {
				node.set('next', dstNode);
			} else {
				this.triggerSegfault();
				return;
			}
		} else {
			this.set(srcPointerId, dstNode);
		}

		//did we just introduce a cycle?
		if (this.cycleDetected()) {
			alert('You just created a cycle. Undoing...');
			return 'undo';
		}
	},


	getDstNode: function(dstNodeId) {

		if (dstNodeId === 'null') {
			return null;
		} else if (dstNodeId === 'new-node') {
			var newNode = new app.models.LinkedListNode({
				//elem: prompt('Enter a new value for this node')
				elem: this.getNewElemValue()
			});

			this.get('nodes').add(newNode);
			return newNode;

		} else {
			// Handle case where Front, Rear, P, or *->Next is set as dst
			if (dstNodeId.indexOf('-next') !== -1) {
				var node = this.get(dstNodeId.replace('-next', ''));
				if (node) {
					return node.get('next');
				} else {
					return null;
				}
			} else {
				return this.get(dstNodeId);
			}
		}

	},

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
			} else if (value.match(/^[1-9][0-9]+$/i) === null) {
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

	elemValueIsUnique: function(value) {
		return (this.get('nodes').get(parseInt(value)) === undefined);
	},


	//Super simple implementation. This'll be as fast as a optimal solution, but it'll
	///use up a wee bit of memory, whereas optimal solutions won't.
	//If memory becomes an issue, I can transition to a fancy version. But for now, I believe the
	//ease of understanding this algorithm outweights the fact that I'll use a wee bit of memory.
	cycleDetected: function() {
		var nodesWeHaveSeen = {};
		var currentNode = this.get('front');

		while (currentNode !== null) {
			if (nodesWeHaveSeen.hasOwnProperty(currentNode.get('elem'))) {
				return true;
			}

			nodesWeHaveSeen[currentNode.get('elem')] = true;
			currentNode = currentNode.get('next');
		}

		return false;
	},

	deleteNode: function(dstNodeId) {
		dstNodeId = dstNodeId.toLowerCase();

		if (dstNodeId === 'null') {
			alert('Cannot delete NULL');
			return;
		}

		var dstNode = this.getDstNode(dstNodeId);

		// Trigger segfault if user attempts to free already-free memory
		if (dstNode.get('freed') === true) {
			this.triggerSegfault();
			return;
		}

		dstNode.set('next', null);
		dstNode.set('freed', true);

	},

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

	//If performance becomes an issue, we can use caching to speed this method up.

	forEachUnreachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var p = this.get('p');
		var t = this.get('t');
		var currentNode = front;
		var seenNodes = {};

		while (currentNode !== null) {
			seenNodes[currentNode.get('elem')] = true;
			currentNode = currentNode.get('next');
		}

		var index = 0;

		while (index < this.get('nodes').length) {
			currentNode = this.get('nodes').at(index);

			if (!seenNodes.hasOwnProperty(currentNode.get('elem')) && currentNode.get('freed') === false) {
				callback(currentNode, front, rear, p, t);
			}

			index = index + 1;
		}
	},

	// Return the ID of the given node (or null of node is null)
	getNodeElem: function (node) {
		if (node === null) {
			return null;
		} else {
			return node.get('elem');
		}
	},

	// Return a serialized object representing the state of the list
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
				next: model.getNodeElem(node.get('next')),
				freed: node.get('freed')
			});
		});
		return state;
	},

	// Update the model to reflect the given state object
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

	// Reset the list model to the default list (used to also initialize app)
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
