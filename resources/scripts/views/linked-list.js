(function ($, _, Backbone, Raphael, app) {

app.views.LinkedList = Backbone.View.extend({
	initialize: function () {
		this.$el.empty();
		this.paper = Raphael(this.el, 800, 400);
		this.render();
	},
	drawNodeText: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.text(
			x + styles.nodeWidth / 2,
			y + styles.nodeHeight / 2,
			String(node.get('elem'))
		).attr({
			'font-size': styles.nodeFontSize
		}).node.setAttribute(
			'class', 'node-elem'
		);
	},
	drawNodeBody: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.rect(
			x, y,
			styles.nodeWidth, styles.nodeHeight
		).node.setAttribute(
			'class', 'node-body'
		);
	},
	drawNodePointerArrow: function (node, nextNode, x, y) {
		var styles = this.constructor.styles;
		this.paper.path([
			'M',
			(x + styles.nodeWidth),
			(y + styles.nodeHeight / 2),
			'L',
			(x + styles.nodeWidth + styles.nodeSpaceX - styles.pointerSpaceEnd),
			(y + styles.nodeHeight / 2)
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	drawNodePointerCircle: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.circle(
			x + styles.nodeWidth,
			y + styles.nodeHeight / 2,
			styles.nodePointerRadius
		).node.setAttribute(
			'class', 'pointer-circle'
		);
	},
	drawNodeNullPointerCircle: function (node, x, y) {
		var styles = this.constructor.styles;
		this.drawNodePointerCircle(node, x, y);
		this.paper.path([
			'M',
			(x + styles.nodeWidth - (styles.nodePointerRadius / Math.SQRT2)),
			(y + styles.nodeHeight / 2 + (styles.nodePointerRadius / Math.SQRT2)),
			'L',
			(x + styles.nodeWidth + (styles.nodePointerRadius / Math.SQRT2)),
			(y + styles.nodeHeight / 2 - (styles.nodePointerRadius / Math.SQRT2)),
			'M',
			(x + styles.nodeWidth - (styles.nodePointerRadius / Math.SQRT2)),
			(y + styles.nodeHeight / 2 - (styles.nodePointerRadius / Math.SQRT2)),
			'L',
			(x + styles.nodeWidth + (styles.nodePointerRadius / Math.SQRT2)),
			(y + styles.nodeHeight / 2 + (styles.nodePointerRadius / Math.SQRT2)),
		]).node.setAttribute(
			'class', 'pointer-null-cross'
		);
	},
	drawNodePointer: function (node, x, y) {
		var nextNode = node.get('next');
		if (nextNode) {
			this.drawNodePointerArrow(node, nextNode, x, y);
			this.drawNodePointerCircle(node, x, y);
		} else {
			this.drawNodeNullPointerCircle(node, x, y);
		}
	},
	drawNode: function (node, x, y) {
		var group = this.paper.set();
		var styles = this.constructor.styles;
		this.drawNodeBody(node, x, y);
		this.drawNodePointer(node, x, y);
		this.drawNodeText(node, x, y);
	},
	render: function () {
		var front = this.model.get('front');
		var rear = this.model.get('rear');
		var p = front;
		var styles = this.constructor.styles;
		var x = styles.canvasPaddingX;
		var y = styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpaceX;
		while (p !== rear) {
			this.drawNode(p, x, y);
			p = p.get('next');
			x += dx;
		}
	}
}, {
	styles: {
		canvasPaddingX: 50,
		canvasPaddingY: 50,
		nodeWidth: 80,
		nodeHeight: 60,
		nodePointerRadius: 8,
		pointerSpaceEnd: 8,
		nodeSpaceX: 50,
		nodeFontSize: 24,
	},
	srcPointers: [
		{value: 'front', label: 'Front'},
		{value: 'front-next', label: 'Front->Next'},
		{value: 'rear', label: 'Rear'},
		{value: 'rear-next', label: 'Rear->Next'},
		{value: 'p', label: 'P'},
		{value: 'p-next', label: 'P->Next'}
	],
	dstPointers: [
		{value: 'front', label: 'Front'},
		{value: 'front-next', label: 'Front->Next'},
		{value: 'rear', label: 'Rear'},
		{value: 'rear-next', label: 'Rear->Next'},
		{value: 'p', label: 'P'},
		{value: 'p-next', label: 'P->Next'},
		{value: 'new-node', label: 'new Node'},
		{value: 'null', label: 'NULL'}
	]
});

}(jQuery, window._, window.Backbone, window.Raphael, window.app));
