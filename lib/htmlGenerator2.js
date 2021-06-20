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

function generate(text, tocBuilders, data) {
	const md = require('markdown-it')(data.markedOptions);

	let extensions = data.extensions;

	if (data.processAttributes !== false) {
		md.use(markdownItAttrs, {
			leftDelimiter: '{:',
			rightDelimiter: '}',
			allowedAttributes: []  // all attributes are allowed
		});

		/* register a custom renderer for fences to put their attributes on their <pre> rather than <code> elements */
		md.renderer.rules.fence = function(tokens, idx, options, env, slf) {
			const token = tokens[idx];
			return  '<pre' + slf.renderAttrs(token) + '><code>' + token.content + '</code></pre>';
		}

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
					/* concatenate by removing all chars between the previous match's last attribute and nextMatch's first attribute */
					text = text.substring(0, previousMatchEnd - match[3].length) + text.substring(nextMatch.index + nextMatch[1].length + nextMatch[2].length);
					REGEX_BLOCK_ATTRIBUTE.lastIndex = match.index; /* stay on the current line */
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
		text = text.replace(/}[^\S\r\n]*{:[^\S\r\n]/g, " ");

		/*
		 * markdown-it-attrs wants header attributes to be on the same line as the header,
		 * so detect and adjust cases where they're not.
		 */
		const REGEX_HEADER_ATTRIBUTE = /((?:^|(?:\r\n|\r|\n))#{1,6}[^\S\r\n][^\n\r]+)(?:\r\n|\r|\n)({:[^\S\r\n][^}\r\n]+}[^\S\r\n]*(?:\r\n|\r|\n))/g;
		text = text.replace(REGEX_HEADER_ATTRIBUTE, function(match, p1, p2) {
			return `${p1} ${p2}`
		});

		/*
		 * markdown-it-attrs only recognizes attributes on a table if there's a line of whitespace
		 * between them.  Detect this and insert a whitespace line.
		 */
		text = text.replace(/(\|[^\r\n]*(?:\r\n|\r|\n))({:[^\S\r\n])/g, function(match, p1, p2) {
			return `${p1}\n${p2}`;
		});
	
		/*
		 * markdown-it-attrs expects quoted values to use double-quotes.
		 */
		regex = /{:[^}\n\r]+}/g;
		match = regex.exec(text);
		while (match) {
			var replacement = match[0].replace(/'/g, '"');
			if (replacement !== match[0]) {
				text = text.replace(match[0], replacement);
			}
			match = regex.exec(text);
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
	text = text.replace(/\n  (\S)/g, function(match, p1) {
	    return `\n    ${p1}`;
	});
	
	/*
	 * The following is intentionally commented. It was an initial attempt to hook directly
	 * into markdown-it's HTML generation process in order to send events to extensions at
	 * generation time.  This was the approach used with the integration with marked, but it
	 * does not apply well in this context, and is potentially brittle.  The alternative
	 * approach that's used instead is to let the full HTML generation complete and then
	 * traverse the tree depth-first and send extension events.  This seems to be working
	 * fine, but am keeping the following commented-out block around just in case it
	 * may be helpful in the future.
	 */

	// originalRenderInline = md.renderer.renderInline.bind(md.renderer);
	// originalRenderToken = md.renderer.renderToken.bind(md.renderer);
	//
	// const tagRegex = /<(\/?)([A-Za-z][A-Za-z0-9]*)/;
	// function parseTag(string) {
	// 	let match = tagRegex.exec(string);
	//	return match ? {tag: match[2], isClose: Boolean(match[1])} : null;
	//}

	// let renderStack = [];
	// let inlineStack = [];
	// let computingInline = false;
	// md.renderer.renderInline = function() {
	// 	computingInline = true;
	// 	var result = originalRenderInline(...arguments);
	// 	computingInline = false;
	// 	// console.log("in-line: " + result);
	// 	renderStack.push({value: result});
	// 	return result; 	/* still accumulating */
	// };
	// md.renderer.renderToken = function() {
	// 	var result = originalRenderToken(...arguments);
	// 	if (computingInline) {
	// 		return result;
	// 	}
	// 	renderStack.push({value: result});
	// 	// console.log("block  : " + result);
	// 	let resultTag = parseTag(result);
	// 	if (resultTag && resultTag.isClose) {
	// 		let index = renderStack.length - 2; /* exclude the close tag that was just pushed */
	// 		while (index >= 0) {
	// 			if (!renderStack[index].isDone) {
	// 				let stackTag = parseTag(renderStack[index].value);
	// 				if (stackTag && stackTag.tag === resultTag.tag) {
	// 					let accum = "";
	// 					for (var i = index; i < renderStack.length; i++) {
	// 						accum += renderStack[i].value;
	// 					}
	// 					console.log("\nExtension " + resultTag.tag + ": " + accum);
	// 					result = accum;
	// 					renderStack[index].value = result;
	// 					renderStack[index].isDone = true;
	// 					renderStack.length = index + 1;
	// 					return result;
	// 				}
	// 			}
	// 			index--;
	// 		}
	// 		console.log("\n\nhmmmmm.....\n\n");
	// 	} else {
	// 		return ""; 	/* still accumulating */
	// 	}
	// };

	var generated = md.render(text);

	/* traverse the generated HTML depth-first and invoke extensions */
	var dom = common.htmlToDom(generated);
	for (let i = 0; i < dom.length; i++) {
		dom[i] = invokeExtensionsOnElement(dom[i], extensions, tocBuilders);
	};
	generated = common.domToHtml(dom);
	
	/* post-processing: escape single-quotes just to be consistent with the old way to make comparison easier */
	generated = generated.replace(/'/g, '&#39;');
	
	var result = {html: {}};
	result.html.text = generated;
	return result;
}

function invokeExtensionsOnElement(element, extensions, tocBuilders) {
	var children = common.domUtils.getChildren(element);
	if (children) {
		children.forEach(function(child) {
			invokeExtensionsOnElement(child, extensions, tocBuilders);
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
				if (common.domUtils.getParent(element).name === "pre") {
					extensionName = "html.onCode"; /* code block */
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
			default:
				console.log("FYI element with no extension: " + element.name)
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
//			for (var propName in additionalData || {}) {
//				data[propName] = additionalData[propName];
//			}
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
