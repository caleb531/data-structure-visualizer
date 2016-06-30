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
	drawNodeBody: function (node, nodeX, nodeY, nodeClasses) {
		var styles = this.constructor.styles;
		this.canvas.rect(
			nodeX, nodeY,
			styles.nodeWidth, styles.nodeHeight
		).node.setAttribute(
			'class', 'node-body' + (nodeClasses ? ' ' + nodeClasses : '')
		);
	},
	// Draw the arrow line that points to a node
	drawNodeNextPointerArrow: function (node, nextNode, nodeX, nodeY) {
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
	drawNodeNextPointerBody: function (node, nodeX, nodeY, nodeClasses) {
		var styles = this.constructor.styles;
		this.canvas.circle(
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2,
			styles.pointerRadius
		).node.setAttribute(
			'class', 'pointer-body' + (nodeClasses ? ' ' + nodeClasses : '')
		);
	},
	// Draw elem text for a reachable node pointed to by an unreachable node
	drawUnreachableNodeNextPointerText: function (node, nextNode, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.text(
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2,
			nextNode.get('elem')
		).attr({
			'font-size': styles.pointerRadius
		}).node.setAttribute(
			'class', 'pointer-elem'
		);
	},
	// Draw null, represented as a square with an nodeX inside
	drawNull: function (node, nodeX, nodeY) {
		var styles = this.constructor.styles;
		this.canvas.path([
			'M',
			nodeX + styles.nodeWidth - (styles.pointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 + (styles.pointerRadius / Math.SQRT2),
			'L',
			nodeX + styles.nodeWidth + (styles.pointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 - (styles.pointerRadius / Math.SQRT2),
			'M',
			nodeX + styles.nodeWidth - (styles.pointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 - (styles.pointerRadius / Math.SQRT2),
			'L',
			nodeX + styles.nodeWidth + (styles.pointerRadius / Math.SQRT2),
			nodeY + styles.nodeHeight / 2 + (styles.pointerRadius / Math.SQRT2),
		]).node.setAttribute(
			'class', 'null'
		);
	},
	// Draw the "next" pointer for a node reachable from Front
	drawReachableNodeNextPointer: function (node, nodeX, nodeY, nodeClasses) {
		var nextNode = node.get('next');
		if (nextNode) {
			this.drawNodeNextPointerArrow(node, nextNode, nodeX, nodeY);
		}
		this.drawNodeNextPointerBody(node, nodeX, nodeY, nodeClasses);
		if (!nextNode) {
			this.drawNull(node, nodeX, nodeY);
		}
	},
	// Draw the "next" pointer for a node not reachable from front
	drawUnreachableNodeNextPointer: function (node, nodeX, nodeY, nodeClasses) {
		var nextNode = node.get('next');
		this.drawNodeNextPointerBody(node, nodeX, nodeY, nodeClasses);
		if (nextNode) {
			this.drawUnreachableNodeNextPointerText(node, nextNode, nodeX, nodeY);
		} else {
			this.drawNull(node, nodeX, nodeY);
		}
	},
	// Draw an entire node (body, text, and pointer)
	drawReachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set();
		this.drawNodeBody(node, nodeX, nodeY, 'reachable');
		this.drawNodeText(node, nodeX, nodeY);
		this.drawReachableNodeNextPointer(node, nodeX, nodeY, 'reachable');
	},
	// Draw an entire unreachable node (body, text, but no pointer because it's
	// not in a chain)
	drawUnreachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set();
		this.drawNodeBody(node, nodeX, nodeY, 'unreachable');
		this.drawNodeText(node, nodeX, nodeY);
		this.drawUnreachableNodeNextPointer(node, nodeX, nodeY, 'unreachable');
	},
	// Draw a position pointer (e.g. Front or Rear or P, including the text)
	drawNodePositionPointer: function (node, nodeX, nodeY, labelId, labelName) {
		var styles = this.constructor.styles;
		this.canvas.circle(
			nodeX + (styles.nodeWidth / 2),
			nodeY - styles.nodeSpace + (styles.pointerSpaceEnd * 2) - styles.pointerRadius,
			styles.pointerRadius
		).node.setAttribute(
			'class', 'pointer-body'
		);
		this.canvas.text(
			nodeX + styles.nodeWidth / 2,
			nodeY - styles.nodeSpace + (styles.pointerSpaceEnd * 2) - styles.pointerRadius,
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
	// Draw label pointers (front, rear, p) for a particular node if pointers
	// point to that node
	drawNodePositionPointers: function (currentNode, front, rear, p, nodeX, nodeY) {
		var styles = this.constructor.styles;
		if (currentNode === front) {
			this.drawNodePositionPointer(currentNode, nodeX - styles.nodeWidth/3, nodeY, 'front', 'F');
		}
		if (currentNode === rear) {
			this.drawNodePositionPointer(currentNode, nodeX + styles.nodeWidth/3, nodeY, 'rear', 'R');
		}
		if (currentNode === p) {
			this.drawNodePositionPointer(currentNode, nodeX, nodeY, 'p', 'P');
		}
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
			view.drawNodePositionPointers(currentNode, front, rear, p, nodeX, nodeY);
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
			view.drawNodePositionPointers(currentNode, front, rear, p, nodeX, nodeY);
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
		pointerRadius: 10,
		pointerSpaceEnd: 10,
		nodeSpace: 50,
		nodeFontSize: 24,
		pointerFontSize: 14
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
