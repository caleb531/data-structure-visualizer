(function () {


app.models.LinkedListNode = Backbone.Model.extend({
	defaults: {
		next: null,
		elem: null,
		freed: false
	},
	idAttribute: 'elem',
	initiailize: function (elem) {
		this.set('elem', elem);
	}
});

var NodeCollection = Backbone.Collection.extend({
	model: app.models.LinkedListNode,
});

app.models.LinkedList = Backbone.Model.extend({
	defaults: {
		front: null,
		rear: null,
		p: null
	},
	initialize: function () {
		this.set('nodes', new NodeCollection());
	},


	setPointer: function (srcPointerId, dstNodeId) {

		if (srcPointerId === dstNodeId) {
			return;
		}

		var dstNode = this.getDstNode(dstNodeId);

		if (srcPointerId.indexOf('-next') !== -1) {
			var node = this.get(srcPointerId.replace('-next', ''));
			if (node) {
				node.set('next', dstNode);
			}
		} else {
			this.set(srcPointerId, dstNode);
		}

		//did we just introduce a cycle?
		if (this.cycleDetected()) {
			window.alert('Say NO to cycles!');
			return 'undo';
		}
	},


	getDstNode: function(dstNodeId) {

		if (dstNodeId === 'null') {
			return null;
		} else if (dstNodeId === 'new-node') {
			var newNode = new app.models.LinkedListNode({
				elem: window.prompt('Enter a new value for this node')
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
		this.get('nodes').remove(dstNode.get('elem'));
		dstNode.set('next', null);
		dstNode.set('elem', '?');
		dstNode.set('freed', true);

	},

	forEachReachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var p = this.get('p');
		var currentNode = front;

		while (currentNode !== null) {
			callback(currentNode, front, rear, p);
			currentNode = currentNode.get('next');
		}
	},

	//If performance becomes an issue, we can use caching to speed this method up.

	forEachUnreachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var p = this.get('p');
		var currentNode = front;
		var seenNodes = {};

		while (currentNode !== null) {
			seenNodes[currentNode.get('elem')] = true;
			currentNode = currentNode.get('next');
		}

		var index = 0;

		while (index < this.get('nodes').length) {
			currentNode = this.get('nodes').at(index);

			if (!seenNodes.hasOwnProperty(currentNode.get('elem'))) {
				callback(currentNode, front, rear, p);
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
			nodes: []
		};
		var nodes = this.get('nodes');
		var view = this;
		nodes.forEach(function (node) {
			state.nodes.push({
				elem: node.get('elem'),
				next: view.getNodeElem(node.get('next'))
			});
		});
		return state;
	},

	setState: function (state) {
		var nodes = this.get('nodes');
		// Empty the node collection before pushing new nodes
		nodes.reset([]);
		var view = this;
		// Initially add all nodes with their IDs and element values
		state.nodes.forEach(function (nodeState) {
			var node = new app.models.LinkedListNode({
				elem: nodeState.elem,
				// Use ID of next node; convert to pointer in next loop
				next: nodeState.next
			});
			if (nodeState.elem === state.front) {
				view.set('front', node);
			}
			if (nodeState.elem === state.rear) {
				view.set('rear', node);
			}
			if (nodeState.elem === state.p) {
				view.set('p', node);
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

	initializeExample: function () {
		this.setState({
			front: 24,
			rear: 99,
			p: 24,
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
