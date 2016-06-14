(function ($, _, Backbone, Raphael, app) {

app.views.LinkedList = Backbone.View.extend({
	initialize: function () {
		this.paper = Raphael('paper-container', 800, 400);
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
		});
	},
	drawNodeBody: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.rect(
			x, y,
			styles.nodeWidth, styles.nodeHeight
		).attr({
			fill: styles.nodeFill,
			stroke: styles.nodeStroke,
			'stroke-width': styles.nodeStrokeWidth
		});
	},
	drawNodePointer: function (node, x, y) {
		var styles = this.constructor.styles;
		var nextNode = node.get('next');
		if (nextNode) {
			this.paper.path([
				'M',
				(x + styles.nodeWidth),
				(y + styles.nodeHeight / 2),
				'L',
				(x + styles.nodeWidth + styles.nodeSpaceX - styles.pointerSpaceEnd),
				(y + styles.nodeHeight / 2)
			]).attr({
				fill: styles.nodeFill,
				stroke: styles.nodeStroke,
				'stroke-width': styles.nodeStrokeWidth,
				'arrow-start': 'oval-wide-long',
				'arrow-end': 'block-wide-long'
			});
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
		nodePointerRadius: 5,
		pointerSpaceEnd: 4,
		nodeSpaceX: 50,
		nodeFontSize: 24,
		nodeFill: '#fff',
		nodeStroke: '#000',
		nodeStrokeWidth: 2,
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
