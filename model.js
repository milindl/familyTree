function Node(name, alterNames, gender, gridX, gridY) {
    /*
      name: String
      alterNames: [String]
      gender: "m" or "f"
      gridX: Number
      gridY: Number
    */
    this.name = name;
    this.alterNames = alterNames;
    if (gender === "m" || gender === "f")
	this.gender = gender;
    this.gridX = gridX;
    this.gridY = gridY;
}

function Path(from, to) {
    this.from = from;
    this.to = to;
}
Path.prototype.isMarriage = function() {
    return this.from.gridY === this.to.gridY;
}
Path.prototype.convertToSteps = function(nodeStyle) {
    var convertToPixels = function(x, y) {
	return [ x*nodeStyle.width, y*nodeStyle.height ];
    };
    var deltaX = this.to.gridX - this.from.gridX;
    var deltaY = this.to.gridY - this.from.gridY;
    return [
	convertToPixels(this.from.gridX, this.from.gridY),
	convertToPixels(this.from.gridX, this.from.gridY + deltaY/2),
	convertToPixels(this.to.gridX, this.from.gridY + deltaY/2),
	convertToPixels(this.to.gridX, this.to.gridY)
    ];
};

Node.prototype.convertToRect = function(nodeStyle) {
    return [
	this.gridX*nodeStyle.width - nodeStyle.width/2,
	this.gridY*nodeStyle.height - nodeStyle.height/2,
	nodeStyle.width,
	nodeStyle.height
    ];
};
