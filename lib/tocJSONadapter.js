/**
 * marked-it
 *
 * Copyright (c) 2018, 2019 IBM Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var common = require("./common");
var path = require("path");

var getTocProperty = function(topicString, propertyName) {
	var object = JSON.parse(topicString);
	var toc = object.toc;
	if (toc) {
		var properties = toc.properties || [];
		for (var i = 0; i < properties.length; i++) {
			if (properties[i].name === propertyName) {
				return properties[i].value;
			}
		}
	}
	return null;
};

var tocJSONadapter = function(extensions) {
	this.extensions = extensions || [];
};

tocJSONadapter.prototype = {
	adjustRelativeLinks: function(object, rootPath) {
		if (object.href) {
			object.href = path.join(rootPath, object.href).replace(/[\\]/g, "/");
		}
		(object.topics || (object.toc ? [object.toc] : [])).forEach(function(current) {
			this.adjustRelativeLinks(current, rootPath);
		}.bind(this));
	},
	appendChildObject: function(parent, child) {
		var target = parent.toc || parent;
		target.topics = target.topics || [];
		target.topics.push(child);
	},
	createLink: function(path, type) {
		var object = {link: {}};
		object.link[type || "toc"] = path;
		return JSON.stringify(object);
	},
	createRoot: function() {
		return {};
	},
	createTopic: function(href, label, id, heading) {
		var object = {href: href, label: label};
		if (id) {
			object.id = id;
		}
		return common.invokeExtensions(
			this.extensions,
			"json.toc.onTopic",
			JSON.stringify(object),
			{
				heading: heading || {},
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domToInnerHtml: common.domToInnerHtml,
				domUtils: common.domUtils,
				escape: common.escape,
				unescape: common.unescape
			});
	},
	getChildren: function(object) {
		return object.toc || object.topics;
	},
	getNext: function(object) {
		var target = object.topics || object;
		if (target._lastIndex === undefined) {
			target._lastIndex = -1;
		}
		if (!Array.isArray(target)) {
			if (target._lastIndex === -1) {
				target._lastIndex = 0;
				return target;
			}
			return null;
		}
		if (target._lastIndex + 1 < target.length) {
			target._lastIndex++;
			return target[target._lastIndex];
		}
		return null;
	},
	getPathPrefix: function(topicString) {
		return getTocProperty(topicString, "path");
	},
	getSubcollection: function(topicString) {
		return getTocProperty(topicString, "subcollection");
	},
	objectToString: function(object, inner, makeItPretty) {
		if (inner) {
			if (object.topics) {
				object = object.topics[0];
			} else {
				var keys = Object.keys(object);
				if (!keys.length) {
					return "";
				}
				object = object[keys[0]];
			}
		}
		return makeItPretty ? JSON.stringify(object, (k,v) => (k === '_lastIndex')? undefined : v, 4) : JSON.stringify(object);
	},
	stringToObject: function(string) {
		try {
			return JSON.parse(string);
		} catch (e) {
			return null;
		}
	}
};

module.exports = tocJSONadapter;
