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
				value: 42
			});
			this.get('nodes').push(dstPointer);
		}
		if (srcPointerName === 'front') {
			this.set('front', dstPointer);
		} else if (srcPointerName === 'rear') {
			this.get('rear', dstPointer);
		}
	}
});

}(jQuery, window._, window.Backbone, window.app));
