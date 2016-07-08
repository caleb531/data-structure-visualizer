(function () {

// Metrics used for calculating position, spacing, and sizing of nodes
var styles = {
	canvasPaddingX: 50,
	canvasPaddingY: 100,
	nodeWidth: 100,
	nodeHeight: 60,
	pointerRadius: 10,
	pointerSpaceEnd: 10,
	nodeSpace: 50,
	nodeFontSize: 24,
	pointerFontSize: 14,
	specialPositionPointerOffset: 100
};

// The view used to display linked list models
app.views.LinkedList = app.views.DataStructure.extend({
	// Draw the text label containing the value for this particular node
	drawNodeElem: function (node, nodeX, nodeY, nodeElem, nodeClasses) {
		this.canvas.text(
			nodeX + styles.nodeWidth / 2,
			nodeY + styles.nodeHeight / 2,
			String(nodeElem)
		).attr({
			'font-size': styles.nodeFontSize
		}).node.setAttribute(
			'class', 'node-elem' + (nodeClasses ? ' ' + nodeClasses : '')
		);
	},
	// Draw the rectangular body of the node
	drawNodeBody: function (node, nodeX, nodeY, nodeClasses) {
		this.canvas.rect(
			nodeX, nodeY,
			styles.nodeWidth, styles.nodeHeight
		).node.setAttribute(
			'class', 'node-body' + (nodeClasses ? ' ' + nodeClasses : '')
		);
	},
	// Draw the arrow line that points to a node
	drawNodeNextPointerArrow: function (node, nextNode, nodeX, nodeY) {
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
	drawNull: function (nullX, nullY) {
		this.canvas.path([
			'M',
			nullX - (styles.pointerRadius / Math.SQRT2),
			nullY + (styles.pointerRadius / Math.SQRT2),
			'L',
			nullX + (styles.pointerRadius / Math.SQRT2),
			nullY - (styles.pointerRadius / Math.SQRT2),
			'M',
			nullX - (styles.pointerRadius / Math.SQRT2),
			nullY - (styles.pointerRadius / Math.SQRT2),
			'L',
			nullX + (styles.pointerRadius / Math.SQRT2),
			nullY + (styles.pointerRadius / Math.SQRT2),
		]).node.setAttribute(
			'class', 'null'
		);
	},
	// Draw the question mark symbol used to denote freed memory
	drawFreed: function (freedX, freedY) {
		this.canvas.text(
			freedX,
			freedY,
			'?'
		).attr({
			'font-size': styles.pointerRadius * 2
		}).node.setAttribute(
			'class', 'freed-symbol'
		);
	},
	// Draw null to be placed on a node's "next" pointer
	drawNodeNull: function (nodeX, nodeY) {
		this.drawNull(
			nodeX + styles.nodeWidth,
			nodeY + styles.nodeHeight / 2
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
			this.drawNodeNull(nodeX, nodeY);
		}
	},
	// Draw the "next" pointer for a node not reachable from front
	drawUnreachableNodeNextPointer: function (node, nodeX, nodeY, nodeClasses) {
		var nextNode = node.get('next');
		this.drawNodeNextPointerBody(node, nodeX, nodeY, nodeClasses);
		if (nextNode) {
			this.drawUnreachableNodeNextPointerText(node, nextNode, nodeX, nodeY);
		} else {
			this.drawNodeNull(nodeX, nodeY);
		}
	},
	// Draw an entire node (body, text, and pointer)
	drawReachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set(), nodeClasses;
		if (node.get('freed') === true) {
			nodeClasses = 'freed';
		} else {
			nodeClasses = 'reachable';
		}
		this.drawNodeBody(node, nodeX, nodeY, nodeClasses);
		if (node.get('freed') === true) {
			this.drawNodeElem(node, nodeX, nodeY, '?', nodeClasses);
		} else {
			this.drawNodeElem(node, nodeX, nodeY, node.get('elem'), nodeClasses);
		}
		this.drawReachableNodeNextPointer(node, nodeX, nodeY, nodeClasses);
	},
	// Draw an entire unreachable node (body, text, but no pointer because it's
	// not in a chain)
	drawUnreachableNode: function (node, nodeX, nodeY) {
		var group = this.canvas.set();
		this.drawNodeBody(node, nodeX, nodeY, 'unreachable');
		this.drawNodeElem(node, nodeX, nodeY, node.get('elem'), 'unreachable');
		this.drawUnreachableNodeNextPointer(node, nodeX, nodeY, 'unreachable');
	},
	drawPositionPointerBody: function (pointerX, pointerY) {
		this.canvas.circle(
			pointerX,
			pointerY,
			styles.pointerRadius
		).node.setAttribute(
			'class', 'pointer-body'
		);
	},
	drawPositionPointerLabel: function (pointerX, pointerY, pointerId, labelName) {
		this.canvas.text(
			pointerX,
			pointerY,
			labelName
		).attr({
			'font-size': styles.pointerFontSize
		}).node.setAttribute(
			'class', pointerId + '-label pointer-label'
		);
	},
	drawPositionPointerArrow: function (pointerX, pointerY, arrowX, arrowY) {
		this.canvas.path([
			'M',
			pointerX,
			pointerY,
			'L',
			arrowX,
			arrowY
		]).attr({
			'arrow-end': 'block-wide-long'
		}).node.setAttribute(
			'class', 'pointer-arrow'
		);
	},
	// Draw a position pointer (e.g. Front or Rear or P) pointing to a node
	drawNodePositionPointer: function (pointerX, nodeY, pointerId, labelName) {
		var pointerY = nodeY - styles.nodeSpace + (styles.pointerSpaceEnd * 2) - styles.pointerRadius;
		var arrowY = nodeY - styles.pointerSpaceEnd;
		this.drawPositionPointerArrow(pointerX, pointerY, pointerX, arrowY);
		this.drawPositionPointerBody(pointerX, pointerY);
		this.drawPositionPointerLabel(pointerX, pointerY, pointerId, labelName);
		this.positionPointersDrawn[pointerId] = true;
	},
	// Draw a position pointer pointing to null
	drawPositionPointerToNull: function (pointerX, pointerY, pointerId, labelName) {
		var arrowX = pointerX + styles.nodeSpace - (styles.pointerSpaceEnd * 2);
		var arrowY = pointerY;
		this.drawPositionPointerArrow(pointerX, pointerY, arrowX, arrowY);
		this.drawPositionPointerBody(pointerX, pointerY);
		this.drawPositionPointerLabel(pointerX, pointerY, pointerId, labelName);
		this.drawNull(arrowX + styles.pointerRadius * Math.SQRT2, arrowY);
		this.positionPointersDrawn[pointerId] = true;
	},
	// Draw a position pointer pointing to freed memory (where no nodes are
	// pointing to that same memory)
	drawPositionPointerToFreed: function (pointerX, pointerY, pointerId, labelName) {
		var arrowX = pointerX + styles.nodeSpace - (styles.pointerSpaceEnd * 2);
		var arrowY = pointerY;
		this.drawPositionPointerArrow(pointerX, pointerY, arrowX, arrowY);
		this.drawPositionPointerBody(pointerX, pointerY);
		this.drawPositionPointerLabel(pointerX, pointerY, pointerId, labelName);
		this.drawFreed(arrowX + styles.pointerRadius * Math.SQRT2, arrowY);
		this.positionPointersDrawn[pointerId] = true;
	},
	// Draw all position pointers (front, rear, p) for a particular node if
	// pointers point to that node
	drawNodePositionPointers: function (currentNode, front, rear, p, t, nodeX, nodeY) {
		var pointerX = nodeX + styles.pointerRadius;
		var dx = (styles.nodeWidth - (2 * styles.pointerRadius)) / 3;
		if (currentNode === front) {
			this.drawNodePositionPointer(pointerX, nodeY, 'front', 'F');
			pointerX += dx;
		}
		if (currentNode === p) {
			this.drawNodePositionPointer(pointerX, nodeY, 'p', 'P');
			pointerX += dx;
		}
		if (currentNode === t) {
			this.drawNodePositionPointer(pointerX, nodeY, 't', 'T');
			pointerX += dx;
		}
		if (currentNode === rear) {
			this.drawNodePositionPointer(pointerX, nodeY, 'rear', 'R');
		}
	},
	// Draw all position pointers that are pointing to null or to deallocated
	// (freed) memory; these are displayed above the linked list in the very top
	// region of the canvas
	drawSpecialPositionPointers: function () {
		var pointerX = styles.canvasPaddingX / 2;
		var pointerY = styles.canvasPaddingX / 2;
		var front = this.model.get('front');
		var p = this.model.get('p');
		var t = this.model.get('t');
		var rear = this.model.get('rear');
		if (front === null) {
			this.drawPositionPointerToNull(pointerX, pointerY, 'front', 'F');
			pointerX += styles.specialPositionPointerOffset;
		} else if (front.get('freed') === true && this.positionPointersDrawn.front !== true) {
			this.drawPositionPointerToFreed(pointerX, pointerY, 'front', 'F');
			pointerX += styles.specialPositionPointerOffset;
		}
		if (p === null) {
			this.drawPositionPointerToNull(pointerX, pointerY, 'p', 'P');
			pointerX += styles.specialPositionPointerOffset;
		} else if (p.get('freed') === true && this.positionPointersDrawn.p !== true) {
			this.drawPositionPointerToFreed(pointerX, pointerY, 'p', 'P');
			pointerX += styles.specialPositionPointerOffset;
		}
		if (t === null) {
			this.drawPositionPointerToNull(pointerX, pointerY, 't', 'T');
			pointerX += styles.specialPositionPointerOffset;
		} else if (t.get('freed') === true && this.positionPointersDrawn.t !== true) {
			this.drawPositionPointerToFreed(pointerX, pointerY, 't', 'T');
			pointerX += styles.specialPositionPointerOffset;
		}
		if (rear === null) {
			this.drawPositionPointerToNull(pointerX, pointerY, 'rear', 'R');
		} else if (rear.get('freed') === true && this.positionPointersDrawn.rear !== true) {
			this.drawPositionPointerToFreed(pointerX, pointerY, 'rear', 'R');
		}
	},
	// Draw all nodes reachable from front pointer
	drawReachableNodes: function () {
		var nodeX = styles.canvasPaddingX;
		var nodeY = styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of reachable nodes by following pointer chain from Front
		this.model.forEachReachable(function (currentNode, front, rear, p, t) {
			view.drawNodePositionPointers(currentNode, front, rear, p, t, nodeX, nodeY);
			view.drawReachableNode(currentNode, nodeX, nodeY);
			nodeX += dx;
		});
	},
	// Draw all nodes not reachable from front pointer
	drawUnreachableNodes: function () {
		var nodeX = styles.canvasPaddingX;
		var nodeY = this.canvas.height - styles.canvasPaddingY;
		var dx = styles.nodeWidth +
			styles.nodeSpace;
		var view = this;
		// Draw list of unreachable nodes at bottom of canvas
		this.model.forEachUnreachable(function (currentNode, front, rear, p, t) {
			view.drawNodePositionPointers(currentNode, front, rear, p, t, nodeX, nodeY);
			view.drawUnreachableNode(currentNode, nodeX, nodeY);
			nodeX += dx;
		});
	},
	render: function () {
		// Clear canvas to start fresh
		this.canvas.clear();
		// A map to keep track of which position pointers (e.g. front, rear, p)
		// have been already drawn
		this.positionPointersDrawn = {};
		// Draw everything
		this.drawReachableNodes();
		this.drawUnreachableNodes();
		this.drawSpecialPositionPointers();
	},
	// Visually flash "next" pointers that have changed according to the given
	// diff between two list states
	applyDiff: function (stateDiff) {
		var $nodeElems = $('.node-elem');
		// Loop through each node elem in the diff
		stateDiff.forEach(function (nodeElem) {
			// Find the SVG element corresponding to the numeric node element
			$nodeElems.each(function (i, nodeElemSVGElem) {
				var $nodeElemSVGElem = $(nodeElemSVGElem);
				// If a corresponding SVG element was found
				if (parseInt($nodeElemSVGElem.text(), 10) === nodeElem) {
					// Add a class to its "next" pointer body to flash it (only
					// for unreachable nodes; only unreachable nodes will have a
					// .pointer-elem SVG element)
					var $nodeNextBodySVGElem = $nodeElemSVGElem
						.next('.pointer-body');
					var $nodeNextElemSVGElem = $nodeNextBodySVGElem
						.next('.pointer-elem');
					// If node has .pointer-elem SVG element
					if ($nodeNextElemSVGElem.length !== 0) {
						// Flash it
						$nodeNextBodySVGElem.addClass('pointer-flash');
						setTimeout(function () {
							$nodeNextBodySVGElem.removeClass('pointer-flash');
						}, 500);
					}
				}
			});
		});
	}
}, {
	// Options to display for lvalue dropdown control on the left
	srcPointerOptions: [
		{value: 'front', label: 'Front'},
		{value: 'front-next', label: 'Front->Next'},
		{value: 'rear', label: 'Rear'},
		{value: 'rear-next', label: 'Rear->Next'},
		{value: 'p', label: 'P'},
		{value: 'p-next', label: 'P->Next'},
		{value: 't', label: 'T'},
		{value: 't-next', label: 'T->Next'}
	],
	// Options to display for rvalue dropdown control on the right
	dstNodeOptions: [
		{value: 'front', label: 'Front'},
		{value: 'front-next', label: 'Front->Next'},
		{value: 'rear', label: 'Rear'},
		{value: 'rear-next', label: 'Rear->Next'},
		{value: 'p', label: 'P'},
		{value: 'p-next', label: 'P->Next'},
		{value: 't', label: 'T'},
		{value: 't-next', label: 'T->Next'},
		{value: 'new-node', label: 'new Node'},
		{value: 'null', label: 'NULL'}
	]
});

}());
