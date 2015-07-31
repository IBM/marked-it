;(function() {
// use strict

var buffer = [];
var urlPrefix;

module.exports = {
	reset: function(filename) {
		buffer = "";
		urlPrefix = filename;
	},
	link: function(href, title, text) {
		/* nothing to do */
	},
	heading: function(text, level, id) {
		for (var i = 0; i < level; i++) {
			buffer += "#";
		}
		buffer += " [";
		buffer += text;
		buffer += "](";
		buffer += urlPrefix + "#" + id;
		buffer += " '";
		buffer += text;
		buffer += "')\n";
	},
	buffer: function() {
		return buffer;
	}
};

})();
