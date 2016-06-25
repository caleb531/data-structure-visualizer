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

	},
	initialize: function () {
		this.set('nodes', new NodeCollection());
		this.set('assignments', []);
	},


	setPointer: function (srcNodeId, dstNodeId) {

		if(srcNodeId === dstNodeId)
			return;

		dstNode = this.getDstNode(dstNodeId);

		//did we find the dstNode?
		if(dstNode == undefined)
			throw new NodeNotFoundException(dstNodeId);

		//is the source valid? (ie: can be found)
		if(!validSrcNode(srcNodeId))
			throw new NodeNotFoundException(srcNodeId);

		var startingNodeID;

		if(srcNodeId === this.get('front').get('id')) {
			this.set('front', dstNode);
			startingNodeID = this.get('front').get('id');
		}
		else if(srcNodeId === this.get('rear').get('id')) {
			this.set('rear', dstNode);
			startingNodeID = this.get('rear').get('id');
		}
		else
		{
			srcNode = this.get('nodes').get(srcNodeId);
			srcNode.set('next', dstNode);
		}

		//did we just introduce a cycle?
		if(cycleDetected()) {
			undo();
			throw "Gah, no cycles! WHY YOU DO THIS??"; //yes, this is a debug message =)
		}
	},


	getDstNode: function(id) {

		//new Node?
		if (id === constants.ids.newNode) {
			var newNode = new app.models.LinkedListNode();
			return newNode;
		}

		//null node?
		if (id === constatnts.ids.nil) {
			return null;
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

		requestedNode = this.get('nodes').get(id);

		if(requestedNode !== undefined && requestedNode !== null)
			return requestedNode;

		return undefined;
	},

	validSrcNode: function(id) {
		
		//front or rear?
		var front = this.get('front');
		if (front !== null && front.id === id) {
			return true;
		}
		var rear = this.get('rear');
		if (rear !== null && rear.id === id) {
			return true;
		}

		requestedNode = this.get('nodes').get(id);

		if(requestedNode !== null && requestedNode !== undefined)
			return true;

		return false;
	},

	//Super simple implementation. This'll be as fast as a optimal solution, but it'll
	///use up a wee bit of memory, whereas optimal solutions won't. 
	//If memory becomes an issue, I can transition to a fancy version. But for now, I believe the
	//ease of understanding this algorithm outweights the fact that I'll use a wee bit of memory.
	cycleDetected: function() {
		nodesWeHaveSeen = {};
		currentNode = this.get('front');

		while(currentNode !== null) {
			if(nodesWeHaveSeen.hasOwnProperty(currentNode.get('id')))
				return true;

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
		var currentNode = front;

		while (currentNode !== null) {
			callback(currentNode, front, rear);
			currentNode = currentNode.get('next');
		}
	},

	//If performance becomes an issue, we can use caching to speed this method up.

	forEachUnreachable: function(callback) {
		var front = this.get('front');
		var rear = this.get('rear');
		var currentNode = front;
		var seenNodes = {};

		while (currentNode !== null) {
			seenNodes[currentNode.get('id')] = true;
			currentNode = currentNode.get('next');
		}

		var index = 0;

		while(index < this.get('nodes').length) {
			currentNode = this.get('nodes').at(index);

			if(!seenNodes.hasOwnProperty(currentNode.get('id')))
				callback(currentNode);

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
	}
});

}(jQuery, window._, window.Backbone, window.app));
