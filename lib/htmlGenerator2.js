/**
 * marked-it
 *
 * Copyright (c) 2021, 2022 IBM Corporation
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
const hljs = require('highlight.js');
const markdownItAttrs = require('@marked-it/markdown-it-attrs');
const markdownItDl = require('markdown-it-deflist');
const markdownItFootnotes = require('markdown-it-footnote');
const markdownItSub = require('markdown-it-sub');
const markdownItSup = require ('markdown-it-sup');
const markdownItTocAndAnchor = require('markdown-it-toc-and-anchor').default;
const taskLists = require('markdown-it-task-lists');
const markdownItSpan = require('markdown-it-bracketed-spans');

const REGEX_CODE_TAG = /<\/?code>/g;
const REGEX_TAG = /<[^>]+>/;
const REGEX_HEADER = /h(\d)/;
const REGEX_NEWLINE = /(^|[^\\])\\n/g;
const REGEX_P = /^<p>((?:.|\n)*)<\/p>\n$/m;
const REGEX_BLOCK_ATTRIBUTE = /(^|(?:\r\n|\r|\n))([^\S\r\n]*)(\{:[^\S\r\n]+[^\}][^\r\n]+\})([^\S\r\n]*)(\r\n|\r|\n)/g;
const MARKEDIT_GEN_ATTR = "markedit-generated";

let md = null;

const REGEX_CODE_FENCE = /(^|(?:\r\n|\r|\n)[^\S\r\n]*)(`{3,})/g;
let lastStartIndex = 0;
let currentIndex = 0;

function findNextCodeFence(text, index) {
	REGEX_CODE_FENCE.lastIndex = index;
	let startMatch = REGEX_CODE_FENCE.exec(text);
	if (!startMatch) {
		return null;
	}
	let endRegex = new RegExp(`(?:^|(?:\r\n|\r|\n))[^\S\r\n]*\`{${startMatch[2].length}}`, "g"); /* custom regex to match the number of backticks from startMatch */
	endRegex.lastIndex = startMatch.index + startMatch[0].length;
	let endMatch = endRegex.exec(text);
	if (!endMatch) {
		return null;
	}
	return {match: startMatch.index, start: startMatch.index + startMatch[1].length, end: endMatch.index + endMatch[0].length};
}

function isWithinCodeFence(text, index, startFromTop) {
	if (startFromTop || index < lastStartIndex) {
		currentIndex = 0; /* starting a new pass from the top */
	}
	lastStartIndex = index; /* store for reference by next invocation */
	if (currentIndex === -1) {
		return false; /* have already encountered the last fence for this pass, no need to continue */
	}
	while (true) {
		let fence = findNextCodeFence(text, currentIndex);
		if (!fence) {
			currentIndex = -1; /* no more fences from here to the end of the file */
			return false;
		}
		if (index < fence.start) {
			currentIndex = index; /* start the next search at this index */
			return false;
		}
		if (fence.start <= index && index < fence.end) {
			currentIndex = fence.match; /* start the next search at the match start of this fence */
			return true;
		}
		currentIndex = fence.end; /* have not gone far enough yet, look for the next fence */
	}
}

function generate(text, tocBuilders, data) {
	md = require('markdown-it')(data.markedOptions);
	md.linkify.set({fuzzyLink: false});
	md.use(markdownItTocAndAnchor, {toc: false, anchorLink: false});

	let extensions = data.extensions;

	let replacedVarsResult = replaceVariables([data.frontMatterMap, data.variablesMap])(text);
	text = replacedVarsResult.text;
	let warnings = replacedVarsResult.warnings;

	if (data.processAttributes !== false) {
		md.use(markdownItAttrs, {
			leftDelimiter: '{:',
			rightDelimiter: '}',
			allowedAttributes: []  // all attributes are allowed
		});

		/*
		 * markdown-it-attrs only handles 1-2 lines of attributes following an element. Detect cases where
		 * an element has > 1 attribute lines and concatenate them onto a single line.
		 */
		REGEX_BLOCK_ATTRIBUTE.lastIndex = 0;
		let match = REGEX_BLOCK_ATTRIBUTE.exec(text);
		let startFromTop = true;
		while (match) {
			let previousMatchEnd = match.index + match[0].length - match[5].length;
			REGEX_BLOCK_ATTRIBUTE.lastIndex = previousMatchEnd;
			let nextMatch = REGEX_BLOCK_ATTRIBUTE.exec(text);
			if (nextMatch) {
				/* to concatenate, nextMatch must immediately follow the first match and have identical leading whitespace */
				if (nextMatch.index === previousMatchEnd && nextMatch[2] === match[2]) {
					if (!isWithinCodeFence(text, previousMatchEnd, startFromTop)) {
						/* concatenate by removing all chars between the previous match's last attribute and nextMatch's first attribute */
						text = text.substring(0, previousMatchEnd - match[4].length) + text.substring(nextMatch.index + nextMatch[1].length + nextMatch[2].length);
						REGEX_BLOCK_ATTRIBUTE.lastIndex = match.index; /* stay on the current line */
					} else {
						REGEX_BLOCK_ATTRIBUTE.lastIndex = previousMatchEnd; /* no change, move along */
					}
					startFromTop = false;
					match = REGEX_BLOCK_ATTRIBUTE.exec(text);
				} else {
					match = nextMatch;
				}
			} else {
				match = null;
			}
		}

		/*
		 * markdown-it-attrs only handles one set of attributes on a given line.
		 * If multiple attribute sets are detected on a line then merge them.
		 */
		const REGEX_MULTIPLE_ATTRIBUTES = /}{:[^\S\r\n]/g;
		match = REGEX_MULTIPLE_ATTRIBUTES.exec(text);
		startFromTop = true;
		while (match) {
			if (!isWithinCodeFence(text, match.index, startFromTop)) {
				text = text.substring(0, match.index) + " " + text.substring(match.index + match[0].length);
				REGEX_MULTIPLE_ATTRIBUTES.lastIndex = match.index;
			} else {
				REGEX_MULTIPLE_ATTRIBUTES.lastIndex = match.index + match[0].length; /* no change, move along */
			}
			startFromTop = false;
			match = REGEX_MULTIPLE_ATTRIBUTES.exec(text);
		}

		/*
		 * markdown-it-attrs wants code fence attributes to be within the fence,
		 * so detect and adjust cases where they're not.
		 */
		let index = 0;
		let fence = findNextCodeFence(text, index);
		let REGEX_OPEN_FENCE = /```[^\r\n]*/g;
		while (fence) {
			REGEX_BLOCK_ATTRIBUTE.lastIndex = fence.end;
			match = REGEX_BLOCK_ATTRIBUTE.exec(text);
			if (match && match.index === fence.end) {
				REGEX_OPEN_FENCE.lastIndex = fence.start;
				let startMatch = REGEX_OPEN_FENCE.exec(text);
				let newText = text.substring(0, startMatch.index + startMatch[0].length) + " " + match[3] + text.substring(startMatch.index + startMatch[0].length, fence.end);
				text = newText + text.substring(fence.end + match[0].length);
				index = newText.length;
			} else {
				index = fence.end;
			}
			fence = findNextCodeFence(text, index);
		}

		/*
		 * markdown-it-attrs wants header attributes to be on the same line as the header,
		 * so detect and adjust cases where they're not.
		 */
		const REGEX_HEADER_ATTRIBUTE = /((?:^|(?:\r\n|\r|\n))#{1,6}[^\S\r\n][^\n\r]+)(?:\r\n|\r|\n)({:[^\S\r\n][^}\r\n]+}[^\S\r\n]*(?:\r\n|\r|\n))/g;
		match = REGEX_HEADER_ATTRIBUTE.exec(text);
		startFromTop = true;
		while (match) {
			if (!isWithinCodeFence(text, match.index, startFromTop)) {
				text = text.substring(0, match.index) + match[1] + " " + match[2] + text.substring(match.index + match[0].length);
				REGEX_HEADER_ATTRIBUTE.lastIndex = match.index;
			} else {
				REGEX_HEADER_ATTRIBUTE.lastIndex = match.index + match[0].length; /* no change, move along */
			}
			startFromTop = false;
			match = REGEX_HEADER_ATTRIBUTE.exec(text);
		}

		/*
		 * markdown-it-attrs expects quoted values to use double-quotes.
		 */
		const REGEX_ATTRIBUTE = /{:([^}\n\r]+)}/g;
		const REGEX_ASSIGN_SINGLEQUOTE = /=[^\S\r\n]*'((?:\\\'|[^\'])*)'/g;
		match = REGEX_ATTRIBUTE.exec(text);
		startFromTop = true;
		while (match) {
			let attribute = match[0];
			if (!isWithinCodeFence(text, match.index, startFromTop)) {
				let assignMatch = REGEX_ASSIGN_SINGLEQUOTE.exec(attribute);
				while (assignMatch) {
					let replacementString = '="' + assignMatch[1].replace(/"/g, '&#34;') + '"';
					attribute = attribute.substring(0, assignMatch.index) + replacementString + attribute.substring(assignMatch.index + assignMatch[0].length);
					REGEX_ASSIGN_SINGLEQUOTE.lastIndex = assignMatch.index + replacementString.length;
					assignMatch = REGEX_ASSIGN_SINGLEQUOTE.exec(attribute);
				}
				if (attribute !== match[0]) {
					text = text.substring(0, match.index) + attribute + text.substring(match.index + match[0].length);
				}
			}
			startFromTop = false;
			REGEX_ATTRIBUTE.lastIndex = match.index + attribute.length;
			match = REGEX_ATTRIBUTE.exec(text);
		}

		/*
		 * markdown-it-attrs has a bug that can cause it to crash if the content ends with an attribute's
		 * closing delimiter and no subsequent whitespace.  Work around it by detecting this case and
		 * adding a trailing space if needed.
		 */
		if (text.charAt(text.length - 1) === "}") {
			text = text + " ";
		}
	}

	if (data.processDefinitionLists !== false) {
		md.use(markdownItDl);
	}

	if (data.processFootnotes !== false) {
		md.use(markdownItFootnotes);
	}

	if (data.processSubscript !== false) {
		md.use(markdownItSub);
	}

	if (data.processSuperscript !== false) {
		md.use(markdownItSup);
	}

	if (data.processTaskLists !== false) {
		md.use(taskLists, {label: true, labelAfter: false, enabled: true});
	}

	if (data.processSpans !== false) {
		md.use(markdownItSpan);
	}

	/*
	 * For containment, using two spaces of indentation is not spec'd to be adequate.  Marked and
	 * markdown-it each honor 2-spaces of indentation in different contexts from each other.  Detect
	 * the 2-spaces case and bump these indentations to four spaces to remove any ambiguity.
	 */
	const REGEX_SPACES = /\n  (\S)/g;
	match = REGEX_SPACES.exec(text);
	startFromTop = true;
	while (match) {
		if (!isWithinCodeFence(text, match.index, startFromTop)) {
			text = text.substring(0, match.index) + `\n    ${match[1]}` + text.substring(match.index + match[0].length);
		}
		startFromTop = false;
		REGEX_SPACES.lastIndex = match.index + match[0].length;
		match = REGEX_SPACES.exec(text);
	}

	let processTableCellContent = data.processTableCellContent !== false;
	if (processTableCellContent) {
		/*
		 * Mark th and td elements that are generated and do not already include any tags,
		 * so that their content will be post-processed later on. The content is split on
		 * "`" characters and only even-indexed segments are checked for tags in order to
		 * segments that are within code blocks.
		 */
		let addAttribute = function(tokens, i, options, env, slf) {
			let segments = tokens[i+1].content.split("`");
			let foundTag = false;
			for (let j = 0; j < segments.length; j += 2) {
				if (REGEX_TAG.test(segments[j])) {
					foundTag = true;
					break;
				}
			}
			if (!foundTag) {
				tokens[i].attrs = tokens[i].attrs || [];
				tokens[i].attrs.push([MARKEDIT_GEN_ATTR, "true"]);
			}
			return slf.renderToken(tokens, i, options, env);
		}
		md.renderer.rules.th_open = addAttribute;
		md.renderer.rules.td_open = addAttribute;
	}

	var generated = md.render(text);

	/* traverse the generated HTML depth-first and invoke extensions */
	var dom = common.htmlToDom(generated);
	for (let i = 0; i < dom.length; i++) {
		dom[i] = invokeExtensionsOnElement(dom[i], extensions, tocBuilders, data.markedOptions.langPrefix, processTableCellContent, data);
	}
	generated = common.domToHtml(dom);

	var result = {html: {}};
	result.html.text = generated;
	result.html.warnings = warnings;
	return result;
}

function invokeExtensionsOnElement(element, extensions, tocBuilders, langPrefix, processTableCellContent, data) {
	var children = common.domUtils.getChildren(element);
	if (children) {
		children.forEach(function(child) {
			invokeExtensionsOnElement(child, extensions, tocBuilders, langPrefix, processTableCellContent, data);
		});
	}
	if (element.name) {
		var extensionName;
		switch (element.name) {
			case "h1":
			case "h2":
			case "h3":
			case "h4":
			case "h5":
			case "h6":
				/* Feed the header to the TOC with footnotes removed */
				let elementCopy = common.htmlToDom(common.domToHtml(element))[0];
				let children = common.domUtils.getChildren(elementCopy);
				for (var i = children.length - 1; i >= 0; i--) {
					if ((children[i].attribs || {})["class"] === "footnote-ref") {
						common.domUtils.removeElement(children[i]);
					}
				}
				let title = common.domUtils.getText(elementCopy);
				let level = REGEX_HEADER.exec(elementCopy.name)[1];
				let html = common.domToHtml(elementCopy);
				tocBuilders.forEach(function(current) {
					current.heading(title, level, html);
				});

				extensionName = "html.onHeading";
				break;
			case "code":
				let parent = common.domUtils.getParent(element);
				if (parent && parent.name === "pre") {
					extensionName = "html.onCode"; /* code block */
					/*
					 * markdown-it-attrs puts code block attributes on the <code> tag, move them to the parent <pre>, except
					 * for the auto-generated `<langPrefix>-XX` class.  Chose to not use a custom rule to accomplish this in
					 * order to not interfere with normal HTML generation, including syntax highlighting.
					 */
					let keys = Object.keys(element.attribs);
					keys.forEach(key => {
						if (key === "class") {
							let langRegex = new RegExp((langPrefix || "") + "\\S+")
							let match = langRegex.exec(element.attribs[key]);
							if (match) {
								element.attribs[key] = element.attribs[key].replace(match[0], "");
							}
							let updatedClasses = element.attribs[key].trim();
							if (updatedClasses.length) {
								parent.attribs[key] = updatedClasses;
							}
							delete element.attribs[key];
							if (match) {
								element.attribs[key] = match[0];
							}
						} else {
							parent.attribs[key] = element.attribs[key];
							delete element.attribs[key];
						}
					});
				} else {
					extensionName = "html.onCodespan";
				}
				break;
			case "pre":
				extensionName = "html.onPre";
				break;	
			case "blockquote":
				extensionName = "html.onBlockquote";
				break;
			case "hr":
				extensionName = "html.onHorizontalRule";
				break;
			case "ol":
			case "ul":
				extensionName = "html.onList";
				break;
			case "li":
				extensionName = "html.onListItem";
				break;
			case "p":
				extensionName = "html.onParagraph";
				break;
			case "table":
				extensionName = "html.onTable";
				break;
			case "tr":
				extensionName = "html.onTablerow";
				break;
			case "td":
			case "th":
				/*
				 * When attributes are defined below a table the default behavior is to create an additional
				 * empty row in the table and add the attributes on its first cell. Detect this case and move
				 * the attributes up to the table element, excluding "style=text-align:..." if present since
				 * it's a cell-level style that's generated by markdown-it.
				 */
				let isFirstColumn = !element.prev || (!element.prev.prev && element.prev.type === 'text');
				let keys = Object.keys(element.attribs);
				if (element.name === "td" && isFirstColumn && keys.length > 0) {
					/* confirm that this is the table's last row and it's fully empty */
					let isLastAndEmpty = true;
					let current = element;
					while (current) {
						if (current.children && current.children.length > 0) {
							isLastAndEmpty = false;
						}
						current = current.next;
					}
					let tr = common.domUtils.getParent(element);
					if (!tr || Boolean((tr.next || {}).next)) {
						isLastAndEmpty = false;
					}

					if (isLastAndEmpty) {
						current = common.domUtils.getParent(element);
						while (current.name !== "table") {
							current = common.domUtils.getParent(current);
						}
						let table = current;
						keys.forEach(function(key) {
							if (key !== MARKEDIT_GEN_ATTR && (key !== "style" || element.attribs[key].indexOf("text-align") !== 0)) {
								table.attribs[key] = element.attribs[key];
								delete element.attribs[key];
							}
						});

						common.domUtils.removeElement(tr);
						if (tr.next) {
							common.domUtils.removeElement(tr.next); /* the row's subsequent \n */
						}
						/* ensure that subsequent elements on this row will no longer process */
						common.domUtils.getChildren(tr).forEach(function(child) {
							child.name = null;
						});
						return;
					}
				}
				/* process table cell content as markdown if appropriate */
				if (processTableCellContent && (element.attribs || {})[MARKEDIT_GEN_ATTR] === "true") {
					delete element.attribs[MARKEDIT_GEN_ATTR];
					let children = common.domUtils.getChildren(element);
					let originalCellContent = common.domToHtml(children);

					/*
					 * If a cell begins with an HTML tag then its full content will be treated as an
					 * HTML pass-through, which will cause subsequent md->html rendering to not happen.
					 * If this case is detected then insert temporary text at the front of the cell
					 * content, do the render, then remove the temporary text afterwards.
					 */
					let tagBreakerInserted = false;
					if ((REGEX_TAG.exec(originalCellContent) || {}).index === 0) {
						originalCellContent = MARKEDIT_GEN_ATTR + " " + originalCellContent;
						tagBreakerInserted = true;
					}

					let updatedCellContent = md.utils.unescapeAll(originalCellContent); /* avoid double-escaping */
					updatedCellContent = updatedCellContent.replace(REGEX_NEWLINE, function(p0, p1) {
						return p1 + '  \n';
					});

					/*
					 * Revert <code> tags to backticks, to ensure that content within inline code is preserved by
					 * the call to #render(). However do not touch the string "<code>" if it appears within a code block.
					 * To handle this specific case the string is broken into segments according to the presence of code
					 * blocks, and contents within code blocks are exempt from having this revert to backticks applied.
					 */
					let CODE_START = "<code>";
					let CODE_END = "</code>";
					let segments = [];
					let index = 0;
					do {
						let start = updatedCellContent.indexOf(CODE_START, index);
						let end = -1;
						if (start !== -1) {
							end = updatedCellContent.indexOf(CODE_END, start);
						}
						if (end === -1) {
							segments.push({text: updatedCellContent.substring(index, updatedCellContent.length), replace: true}); /* not found, typical case */
							index = -1;
						} else {
							segments.push({text: updatedCellContent.substring(index, start + CODE_START.length), replace: true});
							segments.push({text: updatedCellContent.substring(start + CODE_START.length, end), replace: false});
							segments.push({text: updatedCellContent.substring(end, end + CODE_END.length), replace: true});
							index = end + CODE_END.length;
						}
					} while (index !== -1);

					updatedCellContent = "";
					segments.forEach(current => {
						updatedCellContent += current.replace ? current.text.replace(REGEX_CODE_TAG, function() { return '`'; }) : current.text;
					});

					let generated = md.render(updatedCellContent);
					let match = REGEX_P.exec(generated);
					if (match) {
						generated = match[1];
					}
					if (tagBreakerInserted) {
						generated = generated.replace(MARKEDIT_GEN_ATTR + " ", ""); /* remove the temporary text */
					}
					if (generated !== originalCellContent) {
						for (let i = children.length - 1; 0 <= i; i--) {
							common.domUtils.removeElement(children[i]);
						}
						let generatedElements = common.htmlToDom(generated);
						generatedElements.forEach(function(current) {
							common.domUtils.appendChild(element, current);
						});
					}
				}
				extensionName = element.name === "td" ? "html.onTablecell" : undefined;
				break;
			case "strong":
				extensionName = "html.onStrong";
				break;
			case "em":
				extensionName = "html.onEmphasis";
				break;
			case "s":
				extensionName = "html.onDel";
				break;
			case "a":
				extensionName = "html.onLink";
				break;
			case "img":
				extensionName = "html.onImage";
				break;
			// default:
			// 	console.log("FYI element with no extension: " + element.name)
		}
		if (extensionName) {
			var data = {
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domToInnerHtml: common.domToInnerHtml,
				domUtils: common.domUtils,
				escape: common.escape,
				unescape: common.unescape,
				replaceVariables: replaceVariables([data.frontMatterMap, data.variablesMap])
			};

			let defaultValue = common.domToHtml(element /*, options*/)
			let returnedValue = common.invokeExtensions(extensions, extensionName, defaultValue, data);
			if (returnedValue !== defaultValue) {
				if (returnedValue === "") {
					common.domUtils.removeElement(element);
					element = null;
				} else {
					let newDom = common.htmlToDom(returnedValue/*, options*/);
					common.domUtils.replaceElement(element, newDom[0]);
					element = newDom[0];
				}
			}
		}
	}
	return element;
}

function replaceVariables(seedMaps) {
	return function(text, variableMaps) {
		let warnings = [];
		if (typeof(text) !== "string") {
			warnings.push("Aborted, first function argument must be a string");
			return {text: text, warnings: warnings};
		}

		variableMaps = variableMaps || [];
		if (!Array.isArray(variableMaps)) {
			variableMaps = [variableMaps];
		}

		if (seedMaps) {
		  if (!Array.isArray(seedMaps)) {
			seedMaps = [seedMaps];
		  }
		  variableMaps = [ ...seedMaps, ...variableMaps];
		}

		var VAR_OPEN = "{{";
		var VAR_CLOSE = "}}";

		var result = "";
		var pos = 0;

		var index = text.indexOf(VAR_OPEN);
		while (index !== -1) {
			if (!isWithinCodeFence(text, index, true)) {
				result += text.substring(pos, index);
				pos = index;

				var endIndex = text.indexOf(VAR_CLOSE, index + VAR_OPEN.length);
				if (endIndex === -1) {
					result += text.substring(pos);
					pos = text.length;
					break;
				}

				var key = text.substring(index + VAR_OPEN.length, endIndex).trim();
				var value = "";

				/*
				* Iterate through the maps in reverse order so that if a key is defined in more
				* than one then the definition from the map with highest precedence wins.
				*/
				for (var i = variableMaps.length - 1; i >= 0; i--) {
					/*
					* First attempt to match the full key string, and if this fails then
					* attempt to match by '.'-separated segments.
					*/
					if (variableMaps[i] && variableMaps[i][key]) {
						value = variableMaps[i][key];
					} else {
						var temp = key.split(".").reduce(
							function get(result, currentKey) {
								if (result) { /* result may be null if content is not valid yaml */
									return result[currentKey];
								}
							},
							variableMaps[i]
						);
						if (temp) {
							value = temp;
						}
					}
				}

				if (value) {
					/*
					* If a value was found then substitute it in-place in text rather than putting it right
					* into result, in order to support variables that resolve to other variables.
					*/
					text = value + text.substring(endIndex + VAR_CLOSE.length);
					pos = 0;
					index = 0;
				} else {
					/*
					* A value was not found, just treat it as plaintext that will be appended to result later.
					*/
					warnings.push("Unresolved variable found: " + text.substring(index, endIndex + VAR_CLOSE.length).trim());
					index = endIndex + VAR_CLOSE.length;
				}
			} else {
				index++;
			}
			index = text.indexOf(VAR_OPEN, index);
		}
		result += text.substring(pos);
		return {text: result, warnings: warnings};
	}
}

module.exports.generate = generate;
