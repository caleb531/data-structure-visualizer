(function ($, _, Backbone, app) {

function NodeNotFoundException(id, message) {
	this.id = id;
	this.message = "";

	if(message !== null) {
		this.message = message;
	}
}

app.models.LinkedListNode = Backbone.Model.extend({
	defaults: {
		elem: null,
		next: null,
		id : null
	},

	initiailize: function (elem) {
		this.set('elem', elem);
	}
});

app.models.LinkedList = Backbone.Model.extend({
	defaults: {
		front: null,
		rear: null,
	},
	initialize: function () {
		this.set('nodes', {}); //node id -> node object
		this.set('ordered_unreachable_nodes' []);  //array of node objects
		this.set('pointer_counter' {}); //node id -> int (count)
	},


	setPointer: function (srcNodeId, dstNodeId) {
		srcNode = getNode(srcNodeId);
		dstNode = getNode(dstNodeId);

		//validate...
		if(srcNode === undefined) {
			throw new NodeNotFoundException(srcNodeId);
		}
		else if(dstNode === undefined) {
			throw new NodeNotFoundException(dstNodeId);
		}

		//is there anything for us to do?
		if(srcNode.next === dstNode)
			return; //nope

		//will changing pointers result in nodes becoming unreachable?
		//[hopefully this is quick enough procedure]
		if(srcNode.next !== null) {
			newlyUnreachableNodes = getNewlyUnreachableNodes(srcNode, dstNode);
			this.ordered_unreachable_nodes.push.apply(newlyUnreachableNodes);
		}

		//apply the requested change of pointers
		srcNode.next = dstNode;
	},

	getNode : function (id) {
		//NULL is indeed a valid node
		if(id === "null") {
			return null;
		}
		else if(this.nodes.hasOwnProperty(id)) {
			return this.nodes.id;
		}
		else {
			return undefined;
		}
	},

	getNewlyUnreachableNodes : function (srcNode, dstNode) {

	}



	initializeExample: function () {
		var node3 = new app.models.LinkedListNode({
			elem: 99,
			id: '2'
		});
		var node2 = new app.models.LinkedListNode({
			elem: 42,
			next: node3,
			id: '1'
		});
		var node1 = new app.models.LinkedListNode({
			elem: 24,
			next: node2,
			id: '0'
		});
		//var nodes = [node1, node2, node3];
		var nodes = {
			'0' : node1,
			'1' : node2,
			'2' : node3
		}
		this.set('nodes', nodes);
		this.set('front', nodes['0']);
		this.set('', nodes[2]);
	}
});

}(jQuery, window._, window.Backbone, window.app));
