"use strict";

// configuration objects

var nodeStyle = {
    // These usually need to contain 5's and stuff to avoid decimal errors when converted to pixels
    width: 150,
    height: 75,
    fontSize: 14
};

var config = {
    canvasId: "maindraw",
    width: 5000,
    height: 5000
};

// Shared objects
var canv = document.getElementById(config.canvasId);
canv.height = config.height;
canv.width = config.width;
var ctx = canv.getContext('2d');

function renderPaths() {
    paths.forEach(function(path) {
	// Begin sketching path
	var pathPoints = path.convertToSteps(nodeStyle);
	ctx.beginPath();
	ctx.moveTo(pathPoints[0][0], pathPoints[0][1]);
	pathPoints
	    .slice(1)
	    .forEach(function(point) {
		ctx.lineTo(point[0], point[1]);
	    });
	ctx.stroke();
    });
}

function renderNodes() {
    // Set some common properties for rendering
    var font = nodeStyle.fontSize +  "px serif";
    ctx.textAlign = "center";

    // Start render
    nodes.forEach(function(node) {

	// First render the rectangle
	var rect = node.convertToRect(nodeStyle);
	ctx.fillStyle = node.gender === "m" ?
	    "steelblue" : "#f66";
	ctx.fillRect.apply(ctx, rect);

	// Now render the text
	ctx.font = font;
	ctx.fillStyle = "black";
	ctx.fillText(node.name,
		     nodeStyle.width * node.gridX,
		     nodeStyle.height * node.gridY - nodeStyle.fontSize/2
		    );
	ctx.font = "italic " + font;
	ctx.fillText(node.alterNames.join(", "),
		     nodeStyle.width * node.gridX,
		     nodeStyle.height * node.gridY +nodeStyle.fontSize/2
		    );
    });
}
function render() {
    ctx.clearRect(0, 0, config.width, config.height);
    renderPaths();
    renderNodes();
}
var trackNodePath = function(e) {
    return track(e, true);
};
var trackNode = function(e) {
    return track(e, false);
};
function startNodeAdd(e) {
    // Make a new Node
    nodes.push( new Node("New Node", [], "f", 0, 0));
    
    // Do I also need to initialize a new Path?
    var elementClickedOn = nodes.filter(function (elem) {
	var boundX = (elem.gridX - 0.5) * nodeStyle.width;
	var boundY = (elem.gridY - 0.5) * nodeStyle.height;
	return (e.pageY > boundY &&
		e.pageY < boundY+nodeStyle.height &&
		e.pageX > boundX &&
		e.pageX < boundX + nodeStyle.width)
    });

    if (elementClickedOn.length === 1) {
	paths.push(new Path(
	    elementClickedOn[0],
	    nodes[nodes.length - 1]
	));
	canv.addEventListener("mousemove", trackNodePath);
    }
    else {
	canv.addEventListener("mousemove", trackNode);
    }
    canv.removeEventListener("click", startNodeAdd);
    canv.addEventListener("click", fixNode);

}

function fixNode(e) {
    canv.addEventListener("click", startNodeAdd);
    canv.removeEventListener("click", fixNode);
    canv.removeEventListener("mousemove", trackNode);
    canv.removeEventListener("mousemove", trackNodePath);
}
// TODO: Refactor to track in an elegant way
function track(e, path) {
    var snapToGrid = function(x, y) {
	return [
	    Math.round(x/nodeStyle.width) * nodeStyle.width,
	    Math.round(y/nodeStyle.height) * nodeStyle.height
	];
    };
    var gridCoords = snapToGrid(e.pageX, e.pageY);
    
    var newNode = new Node("New Node", [], "f",
			 gridCoords[0]/nodeStyle.width + 0.5,
			   gridCoords[1]/nodeStyle.height + 0.5);
    var oldNode = nodes.pop();
    nodes.push(newNode);
    if (path) {
	var oldPath = paths.pop();
	paths.push(new Path(
	    oldPath.from,
	    newNode
	));
    }
    if (JSON.stringify(newNode) !== JSON.stringify(oldNode)) 
	render();
    console.log(JSON.stringify(newNode));
}

render();
canv.addEventListener("click", startNodeAdd);
