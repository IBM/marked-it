/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

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
