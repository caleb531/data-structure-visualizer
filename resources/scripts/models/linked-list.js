(function ($) {
$(document).ready(function () {

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
		count: 0
	},
	incrementCount: function () {
		this.set('count', this.get('count') + 1);
	},
	decrementCount: function () {
		this.set('count', this.get('count') - 1);
	},
	addRear: function (elem) {
		newNode = new app.models.LinkedListNode({
			elem: elem
		});
		newNode.set('next', null);
		if (this.get('front') === null) {
        	// Special case where list is currently empty
			this.set('front', newNode);
			this.set('rear', newNode);
		} else {
			// Regular case
			this.get('rear').set('next', newNode);
			this.set('rear', newNode);
		}
		this.incrementCount();
	}
});

});
}(jQuery));
