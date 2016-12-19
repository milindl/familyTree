function loadScript(src, callback) {
    var scrTag = document.createElement("script");
    scrTag.src = src;
    document.body.appendChild(scrTag);
    scrTag.onload = scrTag.onreadystatechange = function() {
	callback();
    }
};
