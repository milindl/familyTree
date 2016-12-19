"use strict";

// configuration objects

var nodeStyle = {
    // These usually need to contain 5's and stuff to avoid decimal errors when converted to pixels
    width: 100,
    height: 30,
    fontSize: 10
};

var config = {
    canvasId: "maindraw",
    width: 10000,
    height: 9000
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
	if (path.isMarriage()) 
	    ctx.setLineDash([1, 0, 1, 1]);
	else
	    ctx.setLineDash([1, 0]);
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
    var font = nodeStyle.fontSize +  "px sans serif";
    ctx.textAlign = "center";

    // Start render
    nodes.forEach(function(node) {

	// First render the rectangle
	var rect = node.convertToRect(nodeStyle);
	ctx.fillStyle = node.gender === "m" ?
	    "steelblue" : "#6f6";
	ctx.fillRect.apply(ctx, rect);

	//Add a node border
	ctx.strokeStyle = "black";
	ctx.strokeRect.apply(ctx, rect);
	
	// Now render the text
	ctx.font = font;
	ctx.fillStyle = "black";
	ctx.setLineDash([1,0]);
	ctx.fillText(node.name,
		     nodeStyle.width * node.gridX,
		     nodeStyle.height * node.gridY - nodeStyle.fontSize/2
		    );
	ctx.font = "italic " + font;
	ctx.fillText(node.alterNames
		     .filter(function(elem) {
			 return elem;
		     })
		     .join(", "),
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

function elementClickedOn(e, nodeStyle) {
    var elementsClickedOn = nodes.filter(function (elem) {
	var boundX = (elem.gridX - 0.5) * nodeStyle.width;
	var boundY = (elem.gridY - 0.5) * nodeStyle.height;
	return (e.pageY > boundY &&
		e.pageY < boundY+nodeStyle.height &&
		e.pageX > boundX &&
		e.pageX < boundX + nodeStyle.width)
    });
    return elementsClickedOn.length === 1 ?
	elementsClickedOn[0] : null;

}
function startNodeAdd(e) {
    // Make a new Node
    nodes.push( new Node("New Node", [], "f", 0, 0));
    
    // Do I also need to initialize a new Path?
    if (elementClickedOn(e, nodeStyle)) {
	paths.push(new Path(
	    elementClickedOn(e, nodeStyle),
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
function startNodeModify(e) {
    // First, we need to be on top of a node to do anything about it
    var elem = elementClickedOn(e, nodeStyle);
    if (elem === null) return;
    canv.removeEventListener(startNodeModify);
    populateFromUser(elem).then(function resolve(node) {
	elem = node;
	render();
	canv.addEventListener(startNodeModify);
    });
}
function fixNode(e) {
    canv.removeEventListener("click", fixNode);
    canv.removeEventListener("mousemove", trackNode);
    canv.removeEventListener("mousemove", trackNodePath);
    var oldNode = nodes.pop();
    populateFromUser(oldNode).then(function resolve(node) {
	canv.addEventListener("click", startNodeAdd);
	nodes.push(node);

	// Deal with paths
	paths.forEach(function(path) {
	    if (path.from === oldNode)
		path.from = node;
	    if (path.to === oldNode)
		path.to = node;
	});
	render();
    });
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
}

// Get user input when needed

function populateFromUser(node) {
    var divProperties = {
	left: node.gridX * nodeStyle.width,
	top: node.gridY * nodeStyle.height
    };
    // Some ugly DOM manipulation follows
    var questionDiv = document.createElement("div");
    questionDiv.id = "questionDiv";
    questionDiv.style.left = divProperties.left + "px";
    questionDiv.style.top = divProperties.top + "px";

    // Create input elements
    var createTextInput = function(id, placeholder, value) {
	var inp = document.createElement("input");
	inp.type = "text"
	inp.id = id;
	inp.placeholder = placeholder;
	if (value)
	    inp.value = value;
	return inp;
    }
    var nameInput = createTextInput("nameInput", "Name", node.name);
    var nickNameInput = createTextInput("nickNameInput", "Optional nickname", node.alterNames[1]);
    var maidenNameInput = createTextInput("maidenNameInput", "Optional maiden name", node.alterNames[0]);
    var genderInput = createTextInput("genderInput", "Gender - m or f", node.gender);
    var submitInput = document.createElement("input");
    submitInput.type = "submit";
    submitInput.value = "Done";

    // Add all to questionDiv
    
    [ nameInput,
      nickNameInput,
      maidenNameInput,
      genderInput,
      submitInput
    ].forEach(function(elem) {
	questionDiv.appendChild(elem);
    });
    document.body.appendChild(questionDiv);
    
    return new Promise(function(resolve, reject) {
	submitInput.addEventListener("click", function(){
	    node.name = nameInput.value;
	    node.gender = genderInput.value;
	    node.alterNames = [];
	    if (maidenNameInput.value)
		node.alterNames.push(maidenNameInput.value);
	    else
		node.alterNames.push("");
	    if (nickNameInput.value)
		node.alterNames.push(nickNameInput.value);
	    else
		node.alterNames.push("");
	    questionDiv.parentNode.removeChild(questionDiv);
	    questionDiv = null; // necessary? 
	    return resolve(node);
	});
    });
}

// Main entry point code

// Need to process initial data
paths = paths.map(function(path) {
    return new Path(
	path.from,
	path.to
    );
});
nodes = nodes.map(function(node) {
    return new Node(
	node.name,
	node.alterNames,
	node.gender,
	node.gridX,
	node.gridY
    );
});
render();

function startAddMode() {
    canv.addEventListener("click", startNodeAdd);
}

function startModifyMode() {
    canv.addEventListener("click", startNodeModify);
}

function startViewMode() {
    canv.onmousemove=function(e){mouse={x:e.pageX-this.offsetLeft,y:e.pageY-this.offsetTop};} 
    canv.onmousemove=function(e){mouse={x:e.pageX-this.offsetLeft,y:e.pageY-this.offsetTop};} 

    var isDown = false;
    var startCoords = [];
    var last = [0, 0];

    canv.onmousedown = function(e) {
	isDown = true;

	startCoords = [
            e.offsetX - last[0],
            e.offsetY - last[1]
	];
    };

    canv.onmouseup   = function(e) {
	isDown = false;
	
	last = [
            e.offsetX - startCoords[0], // set last coordinates
            e.offsetY - startCoords[1]
	];
    };

    canv.onmousemove = function(e)
    {
	if(!isDown) return;
	
	var x = e.offsetX;
	var y = e.offsetY;
	ctx.setTransform(1, 0, 0, 1,
			 x - startCoords[0], y - startCoords[1]);
	render();
    }
}
startModifyMode();
