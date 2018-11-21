/**
 * marked-it
 *
 * Copyright (c) 2018 IBM Corporation
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

;(function() {
// use strict

var common = require("./common");

module.exports = function(callbacks, urlPrefix, tocDepth) {
	var dom = {toc:{}};

	var stack = [dom.toc]; /* a basic stack to represent TOC tree structure */
	var errors;
	var titleText, titleId;

	return {
		heading: function(text, level, heading) {
			if (errors) {
				return false;
			}

			var attributes = common.htmlToDom(heading)[0].attribs;
			if (!titleText && level <= 2) {
				titleText = text;
				titleId = attributes.id;
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
//				var topicAttributes = [];
//				if (attributes) {
//					Object.keys(attributes).forEach(function(current) {
//						if (current.indexOf(PREFIX_TOC) === 0) {
//							var name = current.substring(PREFIX_TOC.length);
//							topicAttributes.push({name: name, value: attributes[current]});
//						}
//					});
//				}
				var newElementText = callbacks.createTopic(urlPrefix + "#" + attributes.id, text, attributes.id, heading);
				if (newElementText) {
					newElement = JSON.parse(newElementText);
					if (!parent.topics) {
						parent.topics = [];
					}
					parent.topics.push(newElement);
				}
			}
			stack.push(newElement);
			return true;
		},
		buffer: function() {
			return JSON.stringify(dom);
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
};

})();
