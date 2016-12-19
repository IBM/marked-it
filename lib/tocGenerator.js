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

var common = require("./common");

module.exports = function(callbacks, urlPrefix, tocDepth, xmlMode) {
	var dom = common.htmlToDom(callbacks.createRoot());

	var stack = [dom]; /* a basic stack to represent TOC tree structure */
	var errors;
	var titleText, titleId;

	return {
		heading: function(text, level, heading) {
			if (errors) {
				return false;
			}

			if (level > stack.length) {
				errors = errors || [];
				errors.push('Invalid heading: ' + text + ' (level=' + level + ' depth=' + (stack.length - 1) + ') in ' + urlPrefix);
				return false;
			}

			stack = stack.slice(0, level);
			var parent = stack[level - 1];
			if (!parent) {
				/* a parent ancestory TOC entry was not generated for a header */
				stack.push(null); /* represents the existence of this header without a TOC entry */
				return true;
			}

			var newElement = null;
			if (level <= tocDepth) {
				var attributes = common.htmlToDom(heading).attribs;

//				var topicAttributes = [];
//				if (attributes) {
//					Object.keys(attributes).forEach(function(current) {
//						if (current.indexOf(PREFIX_TOC) === 0) {
//							var name = current.substring(PREFIX_TOC.length);
//							topicAttributes.push({name: name, value: attributes[current]});
//						}
//					});
//				}
				var newElementText = callbacks.createTopic(urlPrefix + "#" + attributes.id, text, level, heading);
				if (newElementText) {
					newElement = common.htmlToDom(newElementText);
					common.domUtils.appendChild(parent, newElement);
				}
			}
			stack.push(newElement);

			if (level === 1 && !titleText) {
				titleText = text;
				titleId = attributes.id;
			}
			return true;
		},
		buffer: function() {
			return common.domToHtml(dom, {xmlMode: xmlMode});
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
	}
};

})();
