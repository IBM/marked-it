/**
 * marked-it
 *
 * Copyright (c) 2014, 2019 IBM Corporation
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
var pd = require("pretty-data").pd;

var getTocProperty = function(topicString, propertyName) {
	var dom = common.htmlToDom(topicString, {xmlMode: true})[0];
	if (dom.name === "toc") {
		var children = dom.children || [];
		for (var i = 0; i < children.length; i++) {
			if (children[i].name === "property" && children[i].attribs && children[i].attribs.name === propertyName) {
				return children[i].attribs.value;
			}
		}
	}
	return null;
};
	
var tocXMLadapter = function(extensions) {
	this.extensions = extensions || [];
};

tocXMLadapter.prototype = {
	adjustRelativeLinks: function(object, rootPath) {
		var elementsWithHref = common.domUtils.find(function(node) {return node.attribs && node.attribs.href;}, [object], true, Infinity);
		elementsWithHref.forEach(function(current) {
			current.attribs.href = path.join(rootPath, current.attribs.href).replace(/[\\]/g, "/");
		});
	},
	appendChildObject: function(parent, child) {
		common.domUtils.appendChild(parent, child);
	},
	createLink: function(path, type) {
		return '<link ' + (type || "toc") + '="' + path + '"></link>';
	},
	createRoot: function() {
		return common.htmlToDom("<toc></toc>")[0];
	},
	createTopic: function(href, label, id, heading) {
		var string = "<topic href='" + href + "' label='" + label + "'";
		if (id) {
			string += " id='" + id + "'";
		}
		string += ">\n</topic>\n";
		return common.invokeExtensions(
			this.extensions,
			"xml.toc.onTopic",
			string,
			{
				heading: heading || {},
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domToInnerHtml: common.domToInnerHtml,
				domUtils: common.domUtils,
				escape: common.escape,
				unescape: common.unescape
			}
		);
	},
	getChildren: function(object) {
		return common.domUtils.getChildren(object);
	},
	getNext: function(object) {
		if (object.lastIndex === undefined) {
			object.lastIndex = 0;
			return object;
		}
		for (var i = 0; i < ++object.lastIndex; i++) {
			if (!object.next) {
				return null;
			}
			object = object.next;
		}
		return object;
	},
	getPathPrefix: function(topicString) {
		return getTocProperty(topicString, "path");
	},
	getSubcollection: function(topicString) {
		return getTocProperty(topicString, "subcollection");
	},
	objectToString: function(object, inner, makeItPretty) {
		var result;
		if (inner) {
			result = common.domToInnerHtml(object, {xmlMode: true});
		} else {
			result = common.domToHtml(object, {xmlMode: true});
		}
		return makeItPretty ? pd.xml(result) : result;
	},
	stringToObject: function(string) {
		return common.htmlToDom(string, {xmlMode: true})[0];
	}
};

module.exports = tocXMLadapter;
