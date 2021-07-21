/**
 * marked-it
 *
 * Copyright (c) 2021 IBM Corporation
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
const markdownItAttrs = require('markdown-it-attrs');
const markdownItDl = require('markdown-it-deflist');
const markdownItFootnotes = require('markdown-it-footnote');

const REGEX_HEADER = /h(\d)/;
const REGEX_BLOCK_ATTRIBUTE = /(^|(?:\r\n|\r|\n))([^\S\r\n]*)\{:[^\S\r\n]+[^\}][^\r\n]+\}([^\S\r\n]*)(\r\n|\r|\n)/g;

const REGEX_CODE_FENCE = /(?:^|(?:\r\n|\r|\n))[^\S\r\n]*(`{3,})/g;
let lastStartIndex = 0;
let currentIndex = 0;
function isWithinCodeFence(text, index) {
	if (index < lastStartIndex) {
		currentIndex = 0; /* starting a new scan from the top */
	}
	lastStartIndex = index; /* store for reference by next invocation */
	if (currentIndex === -1) {
		return false; /* have already encountered the last fence for this pass, no need to continue */
	}
	while (true) {
		REGEX_CODE_FENCE.lastIndex = currentIndex;
		let startMatch = REGEX_CODE_FENCE.exec(text);
		if (!startMatch) {
			currentIndex = -1; /* no more fences from here to the end of the file */
			return false;
		}
		if (index < startMatch.index) {
			currentIndex = index; /* start the next search at this index */
			return false;
		}
		let endRegex = new RegExp(`(?:^|(?:\r\n|\r|\n))[^\S\r\n]*\`{${startMatch[1].length}}`, "g"); /* custom regex to match the number of backticks from startMatch */
		endRegex.lastIndex = startMatch.index + startMatch[0].length;
		let endMatch = endRegex.exec(text);
		if (!endMatch) {
			currentIndex = -1; /* no more proper fences from here to the end of the file */
			return false;
		}
		if (startMatch.index < index && index < endMatch.index + endMatch[0].length) {
			currentIndex = startMatch.index; /* start the next search at this fence */
			return true;
		}
		currentIndex = endMatch.index + endMatch[0].length; /* have not gone far enough yet, look for the next fence */
	}
}

function generate(text, tocBuilders, data) {
	const md = require('markdown-it')(data.markedOptions);

	let extensions = data.extensions;

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
		while (match) {
			let previousMatchEnd = match.index + match[0].length - match[4].length;
			REGEX_BLOCK_ATTRIBUTE.lastIndex = previousMatchEnd;
			let nextMatch = REGEX_BLOCK_ATTRIBUTE.exec(text);
			if (nextMatch) {
				/* to concatenate, nextMatch must immediately follow the first match and have identical leading whitespace */
				if (nextMatch.index == previousMatchEnd && nextMatch[2] === match[2]) {
					if (!isWithinCodeFence(text, previousMatchEnd)) {
						/* concatenate by removing all chars between the previous match's last attribute and nextMatch's first attribute */
						text = text.substring(0, previousMatchEnd - match[3].length) + text.substring(nextMatch.index + nextMatch[1].length + nextMatch[2].length);
						REGEX_BLOCK_ATTRIBUTE.lastIndex = match.index; /* stay on the current line */
					} else {
						REGEX_BLOCK_ATTRIBUTE.lastIndex = previousMatchEnd; /* no change, move along */
					}
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
		const REGEX_MULTIPLE_ATTRIBUTES = /}[^\S\r\n]*{:[^\S\r\n]/g;
		match = REGEX_MULTIPLE_ATTRIBUTES.exec(text);
		while (match) {
			if (!isWithinCodeFence(text, match.index)) {
				text = text.substring(0, match.index) + " " + text.substring(match.index + match[0].length);
				REGEX_MULTIPLE_ATTRIBUTES.lastIndex = match.index;
			} else {
				REGEX_MULTIPLE_ATTRIBUTES.lastIndex = match.index + match[0].length; /* no change, move along */
			}
			match = REGEX_MULTIPLE_ATTRIBUTES.exec(text);
		}

		/*
		 * markdown-it-attrs wants header attributes to be on the same line as the header,
		 * so detect and adjust cases where they're not.
		 */
		const REGEX_HEADER_ATTRIBUTE = /((?:^|(?:\r\n|\r|\n))#{1,6}[^\S\r\n][^\n\r]+)(?:\r\n|\r|\n)({:[^\S\r\n][^}\r\n]+}[^\S\r\n]*(?:\r\n|\r|\n))/g;
		match = REGEX_HEADER_ATTRIBUTE.exec(text);
		while (match) {
			if (!isWithinCodeFence(text, match.index)) {
				text = text.substring(0, match.index) + match[1] + " " + match[2] + text.substring(match.index + match[0].length);
				REGEX_HEADER_ATTRIBUTE.lastIndex = match.index;
			} else {
				REGEX_HEADER_ATTRIBUTE.lastIndex = match.index + match[0].length; /* no change, move along */
			}
			match = REGEX_HEADER_ATTRIBUTE.exec(text);
		}

		/*
		 * markdown-it-attrs only recognizes attributes on a table if there's a line of whitespace
		 * between them.  Detect this and insert a whitespace line.
		 */
		const REGEX_TABLE_ATTRIBUTE = /(\|[^\r\n]*(?:\r\n|\r|\n))({:[^\S\r\n])/g;
		match = REGEX_TABLE_ATTRIBUTE.exec(text);
		while (match) {
			if (!isWithinCodeFence(text, match.index)) {
				text = text.substring(0, match.index) + match[1] + "\n" + match[2] + text.substring(match.index + match[0].length);
				REGEX_TABLE_ATTRIBUTE.lastIndex = match.index;
			} else {
				REGEX_TABLE_ATTRIBUTE.lastIndex = match.index + match[0].length; /* no change, move along */
			}
			match = REGEX_TABLE_ATTRIBUTE.exec(text);
		}

		/*
		 * markdown-it-attrs expects quoted values to use double-quotes.
		 */
		const REGEX_ATTRIBUTE = /{:([^}\n\r]+)}/g;
		const REGEX_ASSIGN_SINGLEQUOTE = /=[^\S\r\n]*'((?:\\\'|[^\'])*)'/g;
		match = REGEX_ATTRIBUTE.exec(text);
		while (match) {
			let attribute = match[0];
			if (!isWithinCodeFence(text, match.index)) {
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
			REGEX_ATTRIBUTE.lastIndex = match.index + attribute.length;
			match = REGEX_ATTRIBUTE.exec(text);
		}
	}

	if (data.processDefinitionLists !== false) {
		md.use(markdownItDl);
	}

	if (data.processFootnotes !== false) {
		md.use(markdownItFootnotes);
	}
	
	/*
	 * For containment, using two spaces of indentation is not spec'd to be adequate.  Marked and
	 * markdown-it each honor 2-spaces of indentation in different contexts from each other.  Detect
	 * the 2-spaces case and bump these indentations to four spaces to remove any ambiguity.
	 */
	const REGEX_SPACES = /\n  (\S)/g;
	match = REGEX_SPACES.exec(text);
	while (match) {
		if (!isWithinCodeFence(text, match.index)) {
			text = text.substring(0, match.index) + `\n    ${match[1]}` + text.substring(match.index + match[0].length); 
		}
		REGEX_SPACES.lastIndex = match.index + match[0].length;
		match = REGEX_SPACES.exec(text);
	}

	var generated = md.render(text);

	/* traverse the generated HTML depth-first and invoke extensions */
	var dom = common.htmlToDom(generated);
	for (let i = 0; i < dom.length; i++) {
		dom[i] = invokeExtensionsOnElement(dom[i], extensions, tocBuilders, data.markedOptions.langPrefix);
	};
	generated = common.domToHtml(dom);

	var result = {html: {}};
	result.html.text = generated;
	return result;
}

function invokeExtensionsOnElement(element, extensions, tocBuilders, langPrefix) {
	var children = common.domUtils.getChildren(element);
	if (children) {
		children.forEach(function(child) {
			invokeExtensionsOnElement(child, extensions, tocBuilders, langPrefix);
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
				/* Feed the header to the TOC  with footnotes removed */
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
				if (parent.name === "pre") {
					extensionName = "html.onCode"; /* code block */
					/*
					 * markdown-it-attrs puts code block attributes on the <code> tag, move them to the parent <pre>, except
					 * for the auto-generated `<langPrefix>-XX` class.  Chose to not use a custom rule to accomplish this in order to
					 * not interfere with normal HTML generation, including syntax highlighting.
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
				extensionName = "html.onTablecell";
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
				unescape: common.unescape
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

module.exports.generate = generate;
