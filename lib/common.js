/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var htmlparser = require("htmlparser2");

function domToHtml(dom, options) {
	return htmlparser.DomUtils.getOuterHTML(dom, options || {});
}

function htmlToDom(string, options) {
	var result;
	var handler = new htmlparser.DomHandler(function(error, dom) {
	    if (error) {
	        console.log("*** Failed to parse HTML:\n" + error.toString());
	    } else {
	        result = dom;
	    }
	});
	var parser = new htmlparser.Parser(handler, options || {});
	parser.write(string.trim());
	parser.done();

	return result[0];
}

function invokeExtensions(extensions, id, string, data) {
	if (!extensions) {
		return string;
	}

	var endNL = /(\r\n|\r|\n)$/.exec(string);

	var current = extensions;
	var segments = id.split(".");
	for (var i = 0; current && i < segments.length; i++) {
		current = current[segments[i]];
	}

	if (current) {
		var extensionsArray;
		if (current instanceof Array) {
			extensionsArray = current;
		} else if (current instanceof Function) {
			extensionsArray = [current];
		}

		if (extensionsArray) {
			extensionsArray.forEach(function(current) {
				var result = current(string, data);
				if (typeof(result) === "string") {
					string = result;
				}
			});
		}
	}

	if (string && endNL && !(new RegExp(endNL[1] + "$")).test(string)) {
		string += endNL[1];
	}
	return string;
}

module.exports.domToHtml = domToHtml;
module.exports.htmlToDom = htmlToDom;
module.exports.domUtils = htmlparser.DomUtils;
module.exports.invokeExtensions = invokeExtensions;
