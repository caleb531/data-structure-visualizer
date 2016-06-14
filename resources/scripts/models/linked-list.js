(function ($, _, Backbone, app) {

app.models.LinkedListNode = Backbone.Model.extend({
	defaults: {
		elem: null,
		next: null
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
		this.set('nodes', []);
	},
	setPointer: function (srcPointerName, dstPointerName) {
		var dstPointer;
		if (dstPointerName === 'front') {
			dstPointer = this.get('front');
		} else if (dstPointerName === 'rear') {
			dstPointer = this.get('rear');
		} else if (dstPointerName === 'null') {
			dstPointer = null;
		} else if (dstPointerName === 'new Node') {
			dstPointer = new app.models.LinkedListNode({
				elem: 42
			});
			this.get('nodes').push(dstPointer);
		}
		if (srcPointerName === 'front') {
			this.set('front', dstPointer);
		} else if (srcPointerName === 'rear') {
			this.get('rear', dstPointer);
		}
	},
	initializeExample: function () {
		var node3 = new app.models.LinkedListNode({
			elem: 99
		});
		var node2 = new app.models.LinkedListNode({
			elem: 42,
			next: node3
		});
		var node1 = new app.models.LinkedListNode({
			elem: 24,
			next: node2
		});
		var nodes = [node1, node2, node3];
		this.set('nodes', nodes);
		this.set('front', nodes[0]);
		this.set('', nodes[nodes.length - 1]);
	}
});

}(jQuery, window._, window.Backbone, window.app));
