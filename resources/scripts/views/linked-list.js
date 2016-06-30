(function () {

app.views.LinkedList = app.views.DataStructure.extend({
	// Draw the text label containing the value for this particular node
	drawNodeText: function (node, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.text(
			nodeX + styles.nodeWidth / 2,
			nodeY + styles.nodeHeight / 2,
			String(node.get('elem'))
		).attr({
			'font-size': styles.nodeFontSize
		}).node.setAttribute(
			'class', 'node-elem'
		);
	},
	// Draw the rectangular body of the node
	drawNodeBody: function (node, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.rect(
			nodeX, nodeY,
			styles.nodeWidth, styles.nodeHeight
		).node.setAttribute(
			'class', 'node-body'
		);
	},
	// Draw the arrow line that points to a node
	drawNodePointerArrow: function (node, nextNode, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.path([
			'M',
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2,
			'L',
			nodeX + styles.nodeWidth + styles.nodeSpace - styles.pointerSpaceEnd,
			nodeY + styles.nodeHeight / 2
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	// Draw the a node's "next" pointer, represented by a circle
	drawNodePointerCircle: function (node, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.circle(
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2,
			styles.nodePointerRadius
		).node.setAttribute(
			'class', 'pointer-body'
		);
	},
	// Draw elem text for a reachable node pointed to by an unreachable node
	drawUnreachableNodePointerText: function (node, nextNode, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.text(
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2,
			nextNode.get('elem')
		).attr({
			'font-size': styles.nodePointerRadius
		}).node.setAttribute(
			'class', 'pointer-elem'
		);
	},
	// Draw null, represented as a square with an nodeX inside
	drawNull: function (node, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.path([
			'M',
			nodeX + styles.nodeWidth - (styles.nodePointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 + (styles.nodePointerRadius / Math.SQRT2),
			'L',
			nodeX + styles.nodeWidth + (styles.nodePointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 - (styles.nodePointerRadius / Math.SQRT2),
			'M',
			nodeX + styles.nodeWidth - (styles.nodePointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 - (styles.nodePointerRadius / Math.SQRT2),
			'L',
			nodeX + styles.nodeWidth + (styles.nodePointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 + (styles.nodePointerRadius / Math.SQRT2),
		]).node.setAttribute(
			'class', 'null'
		);
	},
	// Draw the "next" pointer for a node reachable from Front
	drawReachableNodePointer: function (node, nodeX, nodeY) {
		var nextNode = node.get('next');
		if (nextNode) {
			this.drawNodePointerArrow(node, nextNode, nodeX, nodeY);
		}
		this.drawNodePointerCircle(node, nodeX, nodeY);
		if (!nextNode) {
			this.drawNull(node, nodeX, nodeY);
		}
	},
	// Draw the "next" pointer for a node not reachable from front
	drawUnreachableNodePointer: function (node, nodeX, nodeY) {
		var nextNode = node.get('next');
		this.drawNodePointerCircle(node, nodeX, nodeY);
		if (nextNode) {
			this.drawUnreachableNodePointerText(node, nextNode, nodeX, nodeY);
		} else {
			this.drawNull(node, nodeX, nodeY);
		}
	},
	// Draw an entire node (body, text, and pointer)
	drawReachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set();
		this.drawNodeBody(node, nodeX, nodeY);
		this.drawNodeText(node, nodeX, nodeY);
		this.drawReachableNodePointer(node, nodeX, nodeY);
	},
	// Draw an entire unreachable node (body, text, but no pointer because it's
	// not in a chain)
	drawUnreachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set();
		this.drawNodeBody(node, nodeX, nodeY);
		this.drawNodeText(node, nodeX, nodeY);
		this.drawUnreachableNodePointer(node, nodeX, nodeY);
	},
	// Draw a label pointer (e.g. for Front or Rear or P, including the text)
	drawLabelPointer: function (node, nodeX, nodeY, labelId, labelName) {
		var styles = this.constructor.styles;
		var bodyWidth = (styles.nodeWidth / 4);
		var bodyHeight = styles.pointerFontSize + (styles.pointerLabelPaddingY * 2);
		this.canvas.rect(
			nodeX + (styles.nodeWidth / 2) - (bodyWidth / 2),
			nodeY - styles.nodeSpace + (styles.pointerFontSize / 2) - (bodyHeight / 2),
			bodyWidth,
			bodyHeight
		).node.setAttribute(
			'class', 'pointer-body'
		);
		this.canvas.text(
			nodeX + styles.nodeWidth / 2,
			nodeY - styles.nodeSpace + (styles.pointerFontSize / 2),
			labelName
		).attr({
			'font-size': styles.pointerFontSize
		}).node.setAttribute(
			'class', labelId + '-label pointer-label'
		);
		this.canvas.path([
			'M',
			nodeX + styles.nodeWidth / 2,
			nodeY - styles.nodeSpace + (styles.pointerSpaceEnd * 2),
			'L',
			nodeX + styles.nodeWidth / 2,
			nodeY - styles.pointerSpaceEnd
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	// Draw all nodes reachable from front pointer
	drawReachableNodes: function () {
		var styles = this.constructor.styles;
		var nodeX = styles.canvasPaddingX;
		var nodeY = styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of reachable nodes by following pointer chain from Front
		this.model.forEachReachable(function (currentNode, front, rear, p) {
			if (currentNode === front) {
				view.drawLabelPointer(currentNode, nodeX - styles.nodeWidth/3, nodeY, 'front', 'F');
			}
			if (currentNode === rear) {
				view.drawLabelPointer(currentNode, nodeX + styles.nodeWidth/3, nodeY, 'rear', 'R');
			}
			if (currentNode === p) {
				view.drawLabelPointer(currentNode, nodeX, nodeY, 'p', 'P');
			}
			view.drawReachableNode(currentNode, nodeX, nodeY);
			nodeX += dx;
		});
	},
	// Draw all nodes not reachable from front pointer
	drawUnreachableNodes: function () {
		var styles = this.constructor.styles;
		var nodeX = styles.canvasPaddingX;
		var nodeY = this.canvas.height - styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of unreachable nodes at bottom of canvas
		this.model.forEachUnreachable(function (currentNode, front, rear, p) {
			if (currentNode === front) {
				view.drawLabelPointer(currentNode, nodeX - styles.nodeWidth/3, nodeY, 'front', 'F');
			}
			if (currentNode === rear) {
				view.drawLabelPointer(currentNode, nodeX + styles.nodeWidth/3, nodeY, 'rear', 'R');
			}
			if (currentNode === p) {
				view.drawLabelPointer(currentNode, nodeX, nodeY, 'p', 'P');
			}
			view.drawUnreachableNode(currentNode, nodeX, nodeY);
			nodeX += dx;
		});
	},
	render: function () {
		this.canvas.clear();
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

}());
