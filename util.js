function loadScript(src, callback) {
    var scrTag = document.createElement("script");
    scrTag.src = src;
    document.body.appendChild(scrTag);
    scrTag.onload = scrTag.onreadystatechange = function() {
	callback();
    }
};

function Main(window) {
    var params = window.location
	.toString()
	.split("?")[1]
        .split("&");
    var mapping = {};
    params.forEach(function(param) {
	var sp = param.split("=");
	mapping[sp[0]] = sp[1];
    });
    console.log(mapping);
    loadScript(mapping["datafile"], function(){
	init();
	render();
	if (mapping["mode"] === "view") {
	    startViewMode();
	    var elemsArray = []
		.slice
		.call(
		    document.getElementsByClassName("editControl")
		);
	
	    elemsArray
		.forEach(function hideExtra(elem) {
		    elem.style.display = "none";
		});
	    render();
	}
	if (mapping["mode"] === "edit") {
	    startAddMode();
	}
    });
}
