/* jshint devel: true */
(function ($, _, Backbone, Raphael, app) {

app.views.LinkedList = app.views.DataStructure.extend({
	// Draw the text label containing the value for this particular node
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
	// Draw the rectangular body of the node
	drawNodeBody: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.rect(
			x, y,
			styles.nodeWidth, styles.nodeHeight
		).node.setAttribute(
			'class', 'node-body'
		);
	},
	// Draw the arrow line that points to a node
	drawNodePointerArrow: function (node, nextNode, x, y) {
		var styles = this.constructor.styles;
		this.paper.path([
			'M',
			(x + styles.nodeWidth),
			(y + styles.nodeHeight / 2),
			'L',
			(x + styles.nodeWidth + styles.nodeSpace - styles.pointerSpaceEnd),
			(y + styles.nodeHeight / 2)
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	// Draw the a node's "next" pointer, represented by a circle
	drawNodePointerCircle: function (node, x, y) {
		var styles = this.constructor.styles;
		this.paper.circle(
			x + styles.nodeWidth,
			y + styles.nodeHeight / 2,
			styles.nodePointerRadius
		).node.setAttribute(
			'class', 'pointer-body'
		);
	},
	// Draw elem text for a reachable node pointed to by an unreachable node
	drawUnreachableNodePointerText: function (node, nextNode, x, y) {
		var styles = this.constructor.styles;
		this.paper.text(
			(x + styles.nodeWidth),
			(y + styles.nodeHeight / 2),
			nextNode.get('elem')
		).attr({
			'font-size': styles.nodePointerRadius
		}).node.setAttribute(
			'class', 'pointer-elem'
		);
	},
	// Draw null, represented as a square with an X inside
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
			'class', 'null'
		);
	},
	// Draw the "next" pointer for a node reachable from Front
	drawReachableNodePointer: function (node, x, y) {
		var nextNode = node.get('next');
		if (nextNode) {
			this.drawNodePointerArrow(node, nextNode, x, y);
		}
		this.drawNodePointerCircle(node, x, y);
		if (!nextNode) {
			this.drawNull(node, x, y);
		}
	},
	// Draw the "next" pointer for a node not reachable from front
	drawUnreachableNodePointer: function (node, x, y) {
		var nextNode = node.get('next');
		this.drawNodePointerCircle(node, x, y);
		if (nextNode) {
			this.drawUnreachableNodePointerText(node, nextNode, x, y);
		} else {
			this.drawNull(node, x, y);
		}
	},
	// Draw an entire node (body, text, and pointer)
	drawReachableNode: function (node, x, y) {
		var group = this.paper.set();
		this.drawNodeBody(node, x, y);
		this.drawNodeText(node, x, y);
		this.drawReachableNodePointer(node, x, y);
	},
	// Draw an entire unreachable node (body, text, but no pointer because it's
	// not in a chain)
	drawUnreachableNode: function (node, x, y) {
		var group = this.paper.set();
		this.drawNodeBody(node, x, y);
		this.drawNodeText(node, x, y);
		this.drawUnreachableNodePointer(node, x, y);
	},
	// Draw a label pointer (e.g. for Front or Rear or P, including the text)
	drawLabelPointer: function (node, x, y, labelId, labelName) {
		var styles = this.constructor.styles;
		var bodyWidth = (styles.nodeWidth / 4);
		var bodyHeight = styles.pointerFontSize + (styles.pointerLabelPaddingY * 2);
		this.paper.rect(
			(x + styles.nodeWidth / 2) - (bodyWidth / 2),
			(y - styles.nodeSpace + (styles.pointerFontSize / 2)) - (bodyHeight / 2),
			bodyWidth,
			bodyHeight
		).node.setAttribute(
			'class', 'pointer-body'
		);
		this.paper.text(
			(x + styles.nodeWidth / 2),
			(y - styles.nodeSpace + (styles.pointerFontSize / 2)),
			labelName
		).attr({
			'font-size': styles.pointerFontSize
		}).node.setAttribute(
			'class', labelId + '-label pointer-label'
		);
		this.paper.path([
			'M',
			(x + styles.nodeWidth / 2),
			(y - styles.nodeSpace + (styles.pointerSpaceEnd * 2)),
			'L',
			(x + styles.nodeWidth / 2),
			(y - styles.pointerSpaceEnd)
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	// Draw all nodes reachable from front pointer
	drawReachableNodes: function () {
		var styles = this.constructor.styles;
		var x = styles.canvasPaddingX;
		var y = styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of reachable nodes by following pointer chain from Front
		this.model.forEachReachable(function (currentNode, front, rear, p) {
			if (currentNode === front) {
				view.drawLabelPointer(currentNode, x - styles.nodeWidth/3, y, 'front', 'F');
			}
			if (currentNode === rear) {
				view.drawLabelPointer(currentNode, x + styles.nodeWidth/3, y, 'rear', 'R');
			}
			if (currentNode === p) {
				view.drawLabelPointer(currentNode, x, y, 'p', 'P');
			}
			view.drawReachableNode(currentNode, x, y);
			x += dx;
		});
	},
	// Draw all nodes not reachable from front pointer
	drawUnreachableNodes: function () {
		var styles = this.constructor.styles;
		var x = styles.canvasPaddingX;
		var y = this.paper.height - styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of unreachable nodes at bottom of canvas
		this.model.forEachUnreachable(function (currentNode, front, rear, p) {
			if (currentNode === front) {
				view.drawLabelPointer(currentNode, x - styles.nodeWidth/3, y, 'front', 'F');
			}
			if (currentNode === rear) {
				view.drawLabelPointer(currentNode, x + styles.nodeWidth/3, y, 'rear', 'R');
			}
			if (currentNode === p) {
				view.drawLabelPointer(currentNode, x, y, 'p', 'P');
			}
			view.drawUnreachableNode(currentNode, x, y);
			x += dx;
		});
	},
	render: function () {
		this.clearCanvas();
		this.drawReachableNodes();
		this.drawUnreachableNodes();
	}
}, {
	// Metrics used for calculating position, spacing, and sizing of nodes
	styles: {
		canvasPaddingX: 50,
		canvasPaddingY: 80,
		nodeWidth: 80,
		nodeHeight: 60,
		nodePointerRadius: 10,
		pointerSpaceEnd: 10,
		nodeSpace: 50,
		nodeFontSize: 24,
		pointerFontSize: 14,
		pointerLabelPaddingY: 2
	},
	// Options to display for lvalue dropdown control on the left
	srcPointerOptions: [
		{value: 'front', label: 'Front'},
		{value: 'front-next', label: 'Front->Next'},
		{value: 'rear', label: 'Rear'},
		{value: 'rear-next', label: 'Rear->Next'},
		{value: 'p', label: 'P'},
		{value: 'p-next', label: 'P->Next'}
	],
	// Options to display for rvalue dropdown control on the right
	dstNodeOptions: [
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
