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
renderPaths();
renderNodes();

