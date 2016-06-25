(function ($, _, Backbone, app) {

var idGenerator = 1;

var constants = {

	//Note: ids <= 0 are reserved
	ids: {
		nil: -1,
		newNode: 0
	}
};



function NodeNotFoundException(id, message) {
	this.id = id;
	this.message = '';

	if (message !== null) {
		this.message = message;
	}
}

function Assignment(srcNode, dstNode, isFront, isRear) {
	this.srcNode = srcNode;
	this.dstNode = dstNode;
	this.isFront = isFront;
	this.isRear = isRear;
}

app.models.LinkedListNode = Backbone.Model.extend({
	defaults: {
		next: null,
		elem: null,
		id : null
	},

	initiailize: function (elem) {
		this.set('elem', elem);
		this.set('id', idGenerator);

		idGenerator = idGenerator + 1;
	}
});

var NodeCollection = Backbone.Collection.extend({
	model: app.models.LinkedListNode
});

app.models.LinkedList = Backbone.Model.extend({
	defaults: {
		front: null,
		rear: null,
		p: null
	},
	initialize: function () {
		this.set('nodes', new NodeCollection());
		this.set('assignments', []);
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
			this.undo();
			// throw 'Gah, no cycles! WHY YOU DO THIS??'; //yes, this is a debug message =)
		}
	},


	getDstNode: function(dstNodeId) {

		if (dstNodeId === 'null') {
			return null;
		} else if (dstNodeId === 'new-node') {
			return new app.models.LinkedListNode({
				elem: window.prompt('Enter a new value for this node')
			});
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
			if (nodesWeHaveSeen.hasOwnProperty(currentNode.get('id'))) {
				return true;
			}

			nodesWeHaveSeen[currentNode.get('id')] = true;
			currentNode = currentNode.get('next');
		}

		return false;
	},

	//TODO
	undo: function() {
		return;
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
			seenNodes[currentNode.get('id')] = true;
			currentNode = currentNode.get('next');
		}

		var index = 0;

		while(index < this.get('nodes').length) {
			currentNode = this.get('nodes').at(index);

			if (!seenNodes.hasOwnProperty(currentNode.get('id'))) {
				callback(currentNode, front, rear, p);
			}

			index = index + 1;
		}
	},


	initializeExample: function () {
		var node3 = new app.models.LinkedListNode({
			elem: 99,
			id: 2
		});
		var node2 = new app.models.LinkedListNode({
			elem: 42,
			next: node3,
			id: 1
		});
		var node1 = new app.models.LinkedListNode({
			elem: 24,
			next: node2,
			id: 0
		});

		var nodes = new NodeCollection();
		nodes.add(node1);
		nodes.add(node2);
		nodes.add(node3);

		this.set('nodes', nodes);
		this.set('front', node1);
		this.set('rear', node3);
		this.set('p', this.get('front'));
	}
});

}(jQuery, window._, window.Backbone, window.app));
