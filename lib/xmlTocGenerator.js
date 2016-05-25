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

var NOTOC = "notoc";
var PREFIX_TOC = "toc-";

var tocBuffer;
var stack, currentTocs, currentToc; /* a basic stack to represents TOC tree structure */
var errors, urlPrefix;
var titleText, titleId;

var reset = function(_urlPrefix) {
	tocBuffer = '<toc>\n';
	stack = [];
	currentTocs = [];
	stack.push(currentTocs);
	currentToc = null;
	errors = null;
	urlPrefix = _urlPrefix;
	titleText = null;
	titleId = null;
}

module.exports = {
	reset: reset,
	heading: function(text, level, attributes) {
		if (errors) {
			return false;
		}

		var id = attributes.id;
		var currentToc = {
			href: urlPrefix + "#" + id,
			title: text,
			children: []
		};

		while (level < stack.length) {
			stack.pop();
			currentTocs = stack[stack.length-1];
			if (currentTocs.length && !((currentTocs[currentTocs.length - 1])[NOTOC])) {
				tocBuffer += '</topic>\n';
			}
		}
		if (level == stack.length) { /* current level */
			if (currentTocs.length > 0 && !((currentTocs[currentTocs.length - 1])[NOTOC])) {
				tocBuffer += '</topic>\n';
			}
			currentTocs.push(currentToc);
		} else if (level == stack.length + 1) { /* next level */
			currentTocs = currentTocs[currentTocs.length-1].children;
			stack.push(currentTocs);
			currentTocs.push(currentToc);
		} else { /* invalid */
			errors = errors || [];
			errors.push('Invalid heading: ' + text + ' (level=' + level + ' depth=' + stack.length + ')');
			return false;
		}

		if (attributes && attributes[NOTOC]) {
			currentToc[NOTOC] = true;
			return true;
		}
		/* if an ancestor defines NOTOC then add it here as well */
		for (var i = 0; i < stack.length; i++) {
			var tocs = stack[i];
			if ((tocs[tocs.length - 1])[NOTOC]) {
				currentToc[NOTOC] = true;
				return true;
			}
		}

		tocBuffer += '<topic href="' + currentToc.href + '" label="' + currentToc.title + '">\n';
		if (attributes) {
			Object.keys(attributes).forEach(function(current) {
				if (current.indexOf(PREFIX_TOC) === 0) {
					var name = current.substring(PREFIX_TOC.length);
					tocBuffer += '<property name="' + name + '" value="' + attributes[current] + '"></property>\n';
				}
			});
		}

		if (level === 1 && !titleText) {
			titleText = text;
			titleId = id;
		}
		return true;
	},
	buffer: function() {
		if (stack.length == 1 && currentTocs.length === 0) {
			/* empty toc or potential first TOC detected */
			return currentToc ? '<toc></toc>\n' : null;
		}
		var topicClosers = '';
		for (var i = 0; i < stack.length; i++) {
			var tocs = stack[i];
			if (!((tocs[tocs.length - 1])[NOTOC])) {
				topicClosers += '</topic>\n';
			}
		}
		return tocBuffer + topicClosers + '</toc>\n';
	},
	getErrors: function() {
		return errors;
	},
	getTitle: function() {
		if (!titleText) {
			return null;
		}
		return {
			text: titleText,
			id: titleId
		};
	}
};

reset("");

})();
