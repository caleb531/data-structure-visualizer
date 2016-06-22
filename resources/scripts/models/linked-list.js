(function ($, _, Backbone, app) {

var idGenerator = 0;
//ids < 0 are reserved!
//Note: id = -1 means a new node.
var newNodeID = -1;



function NodeNotFoundException(id, message) {
	this.id = id;
	this.message = '';

	if (message !== null) {
		this.message = message;
	}
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

	},
	initialize: function () {
		this.set('reachableNodes', new NodeCollection());
		this.set('unreachableNodes', new NodeCollection());
	},


	setPointer: function (srcNodeId, dstNodeId) {
		var srcNode = this.getNode(srcNodeId);
		var dstNode = this.getNode(dstNodeId);

		//did we find both the src and the dst node?
		if (srcNode === undefined) {
			throw new NodeNotFoundException(srcNodeId);
		}
		if (dstNode === undefined) {
			throw new NodeNotFoundException(dstNodeId);
		}

		//is there anything for us to do?
		if (srcNode.next === dstNode) {
			return; //nope
		}

		//will changing pointers result in nodes becoming unreachable?
		//[hopefully this is quick enough procedure, otherwise I'll optimize
		//it]
		if (srcNode.next !== null) {
			this.updateNodeCollections(srcNode.next, dstNode);
		}

		//apply the requested change of pointers
		srcNode.next = dstNode;
	},


	getNode: function(id) {
		var newNode;
		//new Node?
		if (id === newNodeID) {
			newNode = new app.models.LinkedListNode();
			return newNode;
		}

		//front or rear?
		var front = this.get('front');
		if (front !== null && front.id === id) {
			return front;
		}

		var rear = this.get('rear');
		if (rear !== null && rear.id === id) {
			return rear;
		}

		//is the requested node reachable?
		var requestedNode = this.get('reachableNodes').get(id);

		if (requestedNode !== null && requestedNode !== undefined) {
			return requestedNode;
		}

		//maybe the requested node is an unreachable node?
		return this.get('unreachableNodes').get(id);
	},

	updateNodeCollections: function (newNode, dstNode) {
		this.get('reachableNodes').add(newNode);

		var newlyUnreachableNodes = this.sublist(newNode, dstNode);

		//remove these nodes from the reachable nodes list
		this.get('reachableNodes').remove(newlyUnreachableNodes);

		//add these guys to the unreachable collection
		this.get('unreachableNodes').add(newlyUnreachableNodes);
	},

	//both parameters are optional
	sublist: function(startNode, endNode) {
		//get out starting place
		var start = this.getStartNode(startNode);
		var end = this.getEndNode(endNode);

		var currentNode = start;
		var results = [];

		//Note: cycles are assumed to not be present for the purposes of this function
		while (currentNode !== null && currentNode.id !== end.id) {
			results.push(currentNode);
		}

		return results;
	},

	getStartNode: function(startNode) {
		if (startNode !== null && startNode !== undefined) {
			return startNode;
		}
		else {
			return this.get('front');
		}
	},

	getEndNode: function(endNode) {
		if (endNode !== null && endNode !== undefined) {
			return endNode;
		}
		else {
			return this.get('rear');
		}
	},

	forEachReachable: function(actionFunction) {
		currentNode = this.get('front');

		while(currentNode !== null) {
			actionFunction(currentNode, this.get('front'), this.get('rear'));
			currentNode = currentNode.next;
		}
	},

	forEachUnreachable: function(actionFunction) {
		var index = 0;

		var len = this.get('unreachableNodes').length;
		var first = this.get('unreachableNodes').at(0);
		var last = this.get('unreachableNodes').at(len - 1);

		while(index < len) {
			actionFunction(this.get('unreachableNodes').at(index), first, last);
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

		this.set('reachableNodes', nodes);
		this.set('unreachableNodes', new NodeCollection());
		this.set('front', node1);
		this.set('rear', node3);
	}
});

}(jQuery, window._, window.Backbone, window.app));
