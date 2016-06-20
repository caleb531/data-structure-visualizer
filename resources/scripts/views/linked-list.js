/* jshint devel: true */
(function ($, _, Backbone, Raphael, app) {

app.views.LinkedList = Backbone.View.extend({
	events: {
		'mousedown .node-body': 'onPressNode',
		'mousedown .pointer-circle': 'onPressPointer'
	},
	initialize: function () {
		this.$el.empty();
		this.paper = Raphael(this.el, 800, 400);
		this.render();
		this.setStep(0);
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
	drawNull: function (node, x, y) {
		var styles = this.constructor.styles;
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
		var styles = this.constructor.styles;
		this.drawNodePointerArrow(node, nextNode, x, y);
		this.drawNodePointerCircle(node, x, y);
		if (!nextNode) {
			this.drawNull(
				node,
				x + styles.nodeSpaceX + styles.pointerSpaceEnd,
				y
			);
		}
	},
	drawNode: function (node, x, y) {
		var group = this.paper.set();
		var styles = this.constructor.styles;
		this.drawNodeBody(node, x, y);
		this.drawNodeText(node, x, y);
		this.drawNodePointer(node, x, y);
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
	},
	setStep: function (stepNum) {
		this.step = stepNum;
		console.log('proceed to step ' + stepNum);
		$(this.paper.canvas).removeClass().addClass('step-' + stepNum);
	},
	onPressPointer: function (event) {
		var $pointer = $(event.target);
		if (this.step === 1 && $pointer.hasClass('src-pointer')) {
			// do something with this.model here
			$pointer.removeClass('src-pointer');
			this.setStep(0);
		} else if (this.step === 0) {
			// do something with this.model here
			$pointer.addClass('src-pointer');
			this.setStep(1);
		}
	},
	onPressNode: function (event) {
		var $node = $(event.target);
		if (this.step === 2 && $node.hasClass('dst-node')) {
			// do something with this.model here
			$node.removeClass('dst-node');
			this.setStep(1);
		} else if (this.step === 1) {
			// do something with this.model here
			$node.addClass('dst-node');
			this.setStep(2);
		}
	}
}, {
	styles: {
		canvasPaddingX: 50,
		canvasPaddingY: 50,
		nodeWidth: 80,
		nodeHeight: 60,
		nodePointerRadius: 10,
		pointerSpaceEnd: 8,
		nodeSpaceX: 50,
		nodeFontSize: 24,
	}
});

}(jQuery, window._, window.Backbone, window.Raphael, window.app));
