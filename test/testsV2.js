/**
 * Copyright (c) 2022 IBM Corporation
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

const assert = require('assert');
const { domUtils } = require('../lib/common');
const fs = require('fs');
const highlightJs = require("highlight.js");
const htmlparser = require("htmlparser2");
const markedIt = require('../lib/marked-it');

const OPTIONS_MARKDOWNIT = {
	html: true,
	linkify: true,
	langPrefix: "lang-",
	typographer: false,
	highlight: function(str, lang) {
		if (lang && highlightJs.getLanguage(lang)) {
			try {
				return highlightJs.highlight(str, { language: lang }).value;
		  	} catch (e) {
				console.warn("Failed to syntax style a code block with language '" + lang + "'\n" + e.toString());
		  	}
		}
		return null;
	  }
};

describe('htmlGenerator2 tests', function() {
	let fd = fs.openSync('test/sourceV2.md', "r");
	let sourceV2 = readFile(fd);

	const options = {
		processAttributes: true,
		processFootnotes: true,
		processFrontMatter: true,
		// variablesMap: conrefMapCopy,
		tocDepth: 6,
		filePath: "outputFilename",
		// extensions: extensions,
		markedOptions: OPTIONS_MARKDOWNIT,
		fixInvalidHeaders: false
		// version: version
	};

	const html = markedIt.generate(sourceV2, options).html.text;
	const dom = htmlToDom(html);

    // before(function() {});
    // beforeEach(function() {});
    // afterEach(function() {});
	// after(function() {});

	describe('Code Block Syntax Styling', function() {
		it("<code> element has 'lang-*' class", function() {
			let preUnknownLang = getElement(dom, "syntaxStylingUnknown");
			let codeBlockUnknownLang = preUnknownLang.children[0];
			let codeElementClass = codeBlockUnknownLang.attribs.class;
			assert(codeElementClass.indexOf("lang-") === 0, `#syntaxStylingUnknown <code> element does not have a class attribute starting with 'lang-'.\n\n${toHTML(preUnknownLang)}\n-----`);
		});
		it("Codeblock attributes are placed on the parent <pre> element", function() {
			let preUnknownLang = getElement(dom, "syntaxStylingUnknown");
			assert(preUnknownLang.attribs.a === "b", `#syntaxStylingUnknown <pre> element does not have attribute 'a=b'.\n\n${toHTML(preUnknownLang)}\n-----`);
			assert(preUnknownLang.attribs.class === "anotherClass", `#syntaxStylingUnknown <pre> element does not have attribute 'class=anotherClass'.\n\n${toHTML(preUnknownLang)}\n-----`);
		});
		it("JS syntax styling is active", function() {
			let codeblockJSLang = getElement(dom, "syntaxStylingJS");
			codeElementClass = codeblockJSLang.children[0].attribs.class;
			assert(codeElementClass.indexOf("lang-js") === 0, "#syntaxStylingJS <code> does not have class 'lang-js'");
			let attributes = htmlparser.DomUtils.find(function(node) {
				return (node.attribs || {}).class === "hljs-attr"
			}, [codeblockJSLang], true);
			assert(attributes.length === 4, `#syntaxStylingJS should contain 4 elements with class 'hljs-attr', but has ${attributes.length}.\n\n${toHTML(codeblockJSLang)}\n-----`);
			let keywords = htmlparser.DomUtils.find(function(node) {
				return (node.attribs || {}).class === "hljs-keyword"
			}, [codeblockJSLang], true);
			assert(keywords.length === 8, `#syntaxStylingJS should contain 8 elements with class 'hljs-keyword', but has ${keywords.length}.\n\n${toHTML(codeblockJSLang)}\n-----`);
		});
	});

	describe('Header ID Generation', function() {
		it("Header element ID generation is active", function() {
			let h1 = getElement(dom, "header-h1");
			assert(h1 && h1.name === "h1", `<h1> with id 'header-h1' was not found.\n\n${toHTML(dom)}`)
		});
		it("Generation of more than one <h1> is allowed", function() {
			let h1 = getElement(dom, "another-h1-header");
			assert(h1 && h1.name === "h1", `<h1> with id 'another-h1-header' was not found.\n\n${toHTML(dom)}`)
		});
		it("Generation of <h6> is allowed", function() {
			let h6 = getElement(dom, "h6");
			assert(h6 && h6.name === "h6", `<h6> with id 'h6' was not found.\n\n${toHTML(dom)}`)
		});
		it("Generation of <h7> is NOT allowed", function() {
			let h7 = getElement(dom, "h7");
			assert(!h7, `An element with id 'h7' was found but should NOT have been.\n\n${toHTML(h7)}`)
		});		
		it("Disambiguation of generated IDs for headers with identical texts", function() {
			let matches = [...html.matchAll(/id="a-repeat-header"/g)];
			assert(matches.length === 1, `There should be 1 element with id 'a-repeat-header' but there are ${matches.length}.\n\n${html}`)
		});
		/* TODO The following is intentionally commented because it reveals a case that should be handled better in the generator */
		// it("Disambiguation of generated IDs for headers with identical IDs", function() {
		// 	let matches = [...html.matchAll(/id="some-header"/g)];
		// 	assert(matches.length === 1, `There should be 1 element with id 'some-header' but there are ${matches.length}.\n\n${html}`)
		// });
	});

	describe('Attributes', function() {
		it("Header with attributes spanning several lines", function() {
			let header = getElement(dom, "alternateHeaderId");
			assert((header.attribs.class || "").indexOf("anotherHeaderClass") !== -1, `Header #alternateHeaderId should have class 'anotherHeaderClass'.\n\n${toHTML(header)}`)
			assert(header.attribs.c === "d", `Header #alternateHeaderId should have attribute 'c=d'.\n\n${toHTML(header)}`);
		});
		it("Multiple sets of attributes on one line", function() {
			let header = getElement(dom, "alternateHeaderId");
			assert(header.attribs.c === "d", `Header #alternateHeaderId should have attribute 'c=d'.\n\n${toHTML(header)}`);
			assert(header.attribs.e === "f", `Header #alternateHeaderId should have attribute 'e=f'.\n\n${toHTML(header)}`);
			assert(header.attribs.a === "b", `Header #alternateHeaderId should have attribute 'a=b'.\n\n${toHTML(header)}`);
			assert((header.attribs.class || "").indexOf("aHeaderClass") !== -1, `Header #alternateHeaderId should have class 'aHeaderClass'.\n\n${toHTML(header)}`)
		});
		it("Attributes with single- and double-quotes", function() {
			let header = getElement(dom, "alternateHeaderId");
			assert(header.attribs.g === "'h'", `Header #alternateHeaderId should have attribute "g='h'".\n\n${toHTML(header)}`);
			/* TODO The following is intentionally commented because it reveals a case that should be handled better in the generator */
			// assert(header.attribs.i === '&quot;j&quot;', `Header #alternateHeaderId should have attribute 'i="j"'.\n\n${toHTML(header)}`);
		});
		it("Code block with attributes", function() {
			let codeBlock = getElement(dom, "codeBlockWithAttributes");
			assert(codeBlock.attribs.a === "b", `Code block #codeBlockWithAttributes should have attribute "a=b".\n\n${toHTML(codeBlock)}`);
		});
	});

	describe('Footnotes', function() {
		it("Footnote with a short and a long reference", function() {
			let footnoteP = getElement(dom, "footnote");
			let anchors = htmlparser.DomUtils.find(function(node) {
				return node.name === "a"
			}, [footnoteP], true);
			assert(anchors.length === 2, `Paragraph #footnote should contain two anchors but has ${anchors.length}.\n\n${toHTML(footnoteP)}`);

			let href1 = anchors[0].attribs.href.substring(1);
			let footnote1 = getElement(dom, href1);
			assert(footnote1, `Footnote ${href1} should be defined but was not found.\n\n${html}`);

			let href2 = anchors[1].attribs.href.substring(1);
			let footnote2 = getElement(dom, href2);
			assert(footnote2, `Footnote ${href2} should be defined but was not found.\n\n${html}`);
			assert(footnote2.children.length > 2, `Footnote ${href2} should have two full paragraphs but appears to have less.\n\n${toHTML(footnote2)}`);			
		});

		it("Footnote with a missing reference", function() {
			let footnoteP = getElement(dom, "footnoteMissing");
			let anchors = htmlparser.DomUtils.find(function(node) {
				return node.name === "a"
			}, [footnoteP], true);
			assert(anchors.length === 0, `Paragraph #footnoteMissing should not contain any anchors has ${anchors.length}.\n\n${toHTML(footnoteP)}`);
		});

		it("Footnote support turned off", function() {
			let customOptions = { ...options };
			customOptions.processFootnotes = false;
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let footnoteP1 = getElement(dom, "footnote");
			let anchors = htmlparser.DomUtils.find(function(node) {
				return node.name === "a"
			}, [footnoteP1], true);
			assert(anchors.length === 0, `Paragraph #footnote should not contain any anchors but has ${anchors.length}.\n\n${toHTML(footnoteP1)}`);

			footnoteP2 = getElement(dom, "footnoteMissing");
			anchors = htmlparser.DomUtils.find(function(node) {
				return node.name === "a"
			}, [footnoteP2], true);
			assert(anchors.length === 0, `Paragraph #footnoteMissing should not contain any anchors but has ${anchors.length}.\n\n${toHTML(footnoteP2)}`);
		});
	});

	describe('Definition Lists', function() {
		it("Definition list support active", function() {
			let definitionLists = htmlparser.DomUtils.find(function(node) {
				return node.name === "dl"
			}, dom, true);
			assert(definitionLists.length === 1, `There should be one <dl> element but there are ${definitionLists.length}.\n\n${html}`);

			let dl = definitionLists[0];
			let terms = htmlparser.DomUtils.find(function(node) {
				return node.name === "dt"
			}, [dl], true);
			assert(terms.length === 2, `The definition list should contain two <dt> elements but has ${terms.length}.\n\n${toHTML(dl)}`);
		});

		it("Definition list support turned off", function() {
			let customOptions = { ...options };
			customOptions.processDefinitionLists = false;
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let definitionLists = htmlparser.DomUtils.find(function(node) {
				return node.name === "dl"
			}, dom, true);
			assert(definitionLists.length === 0, `There should be no <dl> elements when Definition Lists support is turned off but there are ${definitionLists.length}.\n\n${html}`);
		});
	});

    // describe('extensionsTest', function() {
	// 	const OUTPUT_GENERATED_HTML = false;
    // 	it('extensionsTest', function() {
	//     	let fd = fs.openSync('test/extensionsTest-source.md', "r");
	//     	let mdText = readFile(fd);
	//     	fs.closeSync(fd);

	// 		function addChild(html, data) {
	// 			let dom = data.htmlToDom(html)[0];
	// 			let newChild = data.htmlToDom(`<child>Child for ${dom.name}</child>`);
	// 			data.domUtils.appendChild(dom, newChild[0]);
	// 			return data.domToHtml(dom);
	// 		}

	//     	let extensions = {
	//     		html: {
	// 				onHeading: addChild,
	// 				onCode: addChild,
	// 				onBlockquote: addChild,
	// 				onHr: addChild,
	// 				onList: addChild,
	// 				onListItem: addChild,
	// 				onParagraph: addChild,
	// 				onTable: addChild,
	// 				onTablerow: addChild,
	// 				onTablecell: addChild,
	// 				onStrong: addChild,
	// 				onEmphasis: addChild,
	// 				onCodespan: addChild,
	// 				onDel: addChild,
	// 				onLink: addChild,
	// 				onImage: function(html, data) {
	// 					/* img tags cannot have children so handle differently from the other element types */
	// 					let dom = data.htmlToDom(html)[0];
	// 					dom.attribs.title = `Title for ${dom.name}`;
	// 					return data.domToHtml(dom);
	// 				}
	//     		}
	//     	};

	// 		let options = getOptions();
	// 		options.extensions = extensions;
	//     	let result = markedIt.generate(mdText, options);
	//     	if (OUTPUT_GENERATED_HTML) {
	//     		console.log("-------------------------------\n" + result.html.text);
	// 		}
	// 		let dom = htmlToDom(result.html.text);

	// 		let elementIds = [
	// 			"h1-atx", "h2-atx", "h3-atx", "h4-atx", "h5-atx", "h6-atx", "h1-setext", "h2-setext",
	// 			"strong1", "strong2", "emphasized1", "emphasized2",
	// 			"codeblock", "codespan", "link1", "paragraph1",
	// 			"blockquote", "ordered-list", "unordered-list", "image1",
	// 			"table"
	// 		];
	// 		elementIds.forEach(function(id) {
	// 			let element = htmlparser.DomUtils.getElementById(id, dom, true);
	// 			assert(element, "Expected element found: #" + id);
	// 			if (element.name === "img") {
	// 				/* img tags cannot have children so handle differently from the other element types */
	// 				assert(element.attribs.title.indexOf(element.name) !== -1, "Expected title text found for: #" + id);
	// 			} else {
	// 				let childChildren = htmlparser.DomUtils.find(function(child) {return child.name === "child"}, [element], true);
	// 				assert(childChildren.length, "Expected extension-added child found for: #" + id);
	// 				let found = false;
	// 				childChildren.forEach(function(child) {
	// 					if (child.children[0].data.indexOf(element.name) !== -1) {
	// 						found = true;
	// 					}
	// 				});
	// 				assert(found, "Expected child text found for: #" + id);
	// 			}
	// 		});
    // 	});
	// });
});

function getElement(dom, id) {
	return htmlparser.DomUtils.getElementById(id, dom, true);
}

function toHTML(dom) {
	return dom ? htmlparser.DomUtils.getInnerHTML(dom, {}) : "";
}

function htmlToDom(string, options) {
	let result;
	let handler = new htmlparser.DomHandler(function(error, dom) {
	    if (error) {
	        console.log("*** Failed to parse HTML:\n" + error.toString());
	    } else {
	        result = dom;
	    }
	});
	let parser = new htmlparser.Parser(handler, options || {});
	parser.write(string.trim());
	parser.done();

	return result;
}

function readFile(fd) {
	let readStat = fs.fstatSync(fd);
	let readBlockSize = readStat.blksize || 4096;
	let fileSize = readStat.size;
	if (!fileSize) {
		return "";
	}
	let inBuffer = Buffer.alloc(fileSize);
	let totalReadCount = 0;
	do {
		var length = Math.min(readBlockSize, fileSize - totalReadCount);
		var readCount = fs.readSync(fd, inBuffer, totalReadCount, length, null);
		if (!readCount) {
			break;
		}
		totalReadCount += readCount;
	} while (totalReadCount < fileSize);
	if (totalReadCount !== fileSize) {
		return null;
	}
	return inBuffer.toString("utf8", 0, inBuffer.length);
}
