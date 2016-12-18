var nodes = [];

nodes.push( new Node("Parent", ["Mother", "Father"],"m", 0.5, 0.5));
nodes.push( new Node("Child", [], "f", 6.5, 5));

var paths = [];
paths.push( new Path(nodes[0], nodes[1]));

