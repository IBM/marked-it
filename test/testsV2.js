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

	const returnedValue = markedIt.generate(sourceV2, options);
	const html = returnedValue.html.text;
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
		it("Attributes support turned off", function() {
			let customOptions = { ...options };
			customOptions.variablesMap = {
				"root-level": "Root-Level",
				"root-level-path": "Root-Level-Path",
				hierarchical: {label: {string: "Hierarchical"}}
			};
			customOptions.processAttributes = false;
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let header = getElement(dom, "alternateHeaderId");
			assert(!header, `Header #alternateHeaderId should not have been findable with attributes support turned off, but it was found.\n\n${toHTML(header)}`);
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

	describe('Linkification', function() {
		it("Plaintext Links", function() {
			let link = getElement(dom, "plaintextLink");
			let linkFound = false;
			link.children.forEach(function(current) {
				if (current.name === "a") {
					linkFound = true;
				}
			});
			assert(linkFound, "Linkification failed for a plaintext link that should have been detected.");
		});
		it("Fuzzy e-mail addresses", function() {
			let fuzzyEmail = getElement(dom, "fuzzyEmail");
			let linkFound = false;
			fuzzyEmail.children.forEach(function(current) {
				if (current.name === "a") {
					linkFound = true;
				}
			});
			assert(linkFound, "Linkification failed for a fuzzy email address that should have been detected.");
		});
		it("Fuzzy Links", function() {
			let fuzzyLink = getElement(dom, "fuzzyLink");
			let linkFound = false;
			fuzzyLink.children.forEach(function(current) {
				if (current.name === "a") {
					linkFound = true;
				}
			});
			assert(!linkFound, "Linkification should have ignored a fuzzy link that was detected.");
		});
	});

	describe('Tables', function() {
		it("Table cells with formatting", function() {
			let table = getElement(dom, "tableWithCellFormatting");
			let em = htmlparser.DomUtils.find(function(node) {
				return node.name === "em"
			}, [table], true);
			let strong = htmlparser.DomUtils.find(function(node) {
				return node.name === "strong"
			}, [table], true);
			assert(em.length && strong.length, `Failed to find the expected <em> and/or <strong> element in the table containing formatting.\n\n${toHTML(table)}`);
		});
		it("Table cells with lists", function() {
			let table = getElement(dom, "tableWithCellFormatting");
			let ul = htmlparser.DomUtils.find(function(node) {
				return node.name === "ul"
			}, [table], true);
			assert(ul.length === 2, `Failed to find the two expected <ul> elements in the table containing lists.\n\n${toHTML(table)}`);
		});
		it("Table cells with newlines", function() {
			let table = getElement(dom, "tableWithCellFormatting");
			let tds = htmlparser.DomUtils.find(function(node) {
				return node.name === "td"
			}, [table], true);
			let missingNewline = false;
			tds.forEach(function(td) {
				let newline = htmlparser.DomUtils.find(function(node) {
					return node.type === "text" && node.data.indexOf("\n") === 0;
				}, [td], true);
				if (!newline.length) {
					missingNewline = true;
				}
			});
			assert(!missingNewline, `Failed to find at least one of the expected newlines in the table containing a \\n in each body cell.\n\n${toHTML(table)}`);
		});
		it("Table header cells with newlines", function() {
			let table = getElement(dom, "tableWithCellFormatting");
			let ths = htmlparser.DomUtils.find(function(node) {
				return node.name === "th"
			}, [table], true);
			let missingNewline = false;
			ths.forEach(function(th) {
				let newline = htmlparser.DomUtils.find(function(node) {
					return node.type === "text" && node.data.indexOf("\n") === 0;
				}, [th], true);
				if (!newline.length) {
					missingNewline = true;
				}
			});
			assert(!missingNewline, `Failed to find at least one of the expected newlines in the table containing a \\n in each header cell.\n\n${toHTML(table)}`);
		});

		it("Table cells with markup within code", function() {
			let table = getElement(dom, "tableWithCellFormatting");
			let lis = htmlparser.DomUtils.find(function(node) {
				return node.name === "li"
			}, [table], true);
			let ok = true;
			lis.forEach(function(li) {
				let child = (li.children || [{}])[0];
				if (child.name !== "code") {
					ok = false;
				} else {
					child = (child.children || [{}])[0];
					if (!/&lt;.+&gt;/.test(child.data)) {
						ok = false;
					}
				}
			});
			assert(ok, `At least one of the table cells containing a markup-like string within an in-line code did not generate properly.\n\n${toHTML(table)}`);
		});

		it("Table that's already HTML", function() {
			let noNewline = getElement(dom, "no-newline");
			assert(noNewline.children.length === 1, `A newline character in an HTML table appears to have caused the cell content to be split into multiple elements but should have been left alone.\n\n${toHTML(noNewline)}`);

			let noList = getElement(dom, "no-list");
			let lis = htmlparser.DomUtils.find(function(node) {
				return node.name === "li"
			}, [noList], true);
			assert(lis.length === 0, `A list character in an HTML table appears to have caused the generation of a list but should have been left alone.\n\n${toHTML(noList)}`);

			let noEm = getElement(dom, "no-em");
			let ems = htmlparser.DomUtils.find(function(node) {
				return node.name === "em"
			}, [noEm], true);
			assert(ems.length === 0, `A '*' character in an HTML table appears to have caused the generation of an <em> but should have been left alone.\n\n${toHTML(noEm)}`);

			let noStrong = getElement(dom, "no-strong");
			let strongs = htmlparser.DomUtils.find(function(node) {
				return node.name === "strong"
			}, [noStrong], true);
			assert(strongs.length === 0, `A '**' sequence in an HTML table appears to have caused the generation of a <strong> but should have been left alone.\n\n${toHTML(noStrong)}`);

			let em = getElement(dom, "em");
			ems = htmlparser.DomUtils.find(function(node) {
				return node.name === "em"
			}, [em], true);
			assert(ems.length === 1, `An <em> in an HTML table should have been preserved in the generated output but appears to have not been.\n\n${toHTML(em)}`);

			let strong = getElement(dom, "strong");
			strongs = htmlparser.DomUtils.find(function(node) {
				return node.name === "strong"
			}, [strong], true);
			assert(strongs.length === 1, `A <strong> in an HTML table should have been preserved in the generated output but appears to have not been.\n\n${toHTML(strong)}`);
		});

		it("Table containing HTML tags", function() {
			let table = getElement(dom, "tableWithTags");
			let ths = htmlparser.DomUtils.find(function(node) {
				return node.name === "th"
			}, [table], true);

			let noNewline = ths[0];
			let brs = htmlparser.DomUtils.find(function(node) {
				return node.name === "br"
			}, [noNewline], true);
			assert(brs.length === 0, `A newline character in a table cell should have been ignored because the cell contains an HTML tag, but apparently was not ignored.\n\n${toHTML(noNewline)}`);

			let newline = ths[1];
			brs = htmlparser.DomUtils.find(function(node) {
				return node.name === "br"
			}, [newline], true);
			assert(brs.length === 1, `A newline character in a table cell should have generated as a <br> since its cell does not contain any HTML tag but apparently did not\n\n${toHTML(newline)}`);

			let tds = htmlparser.DomUtils.find(function(node) {
				return node.name === "td"
			}, [table], true);

			let noStrong = tds[0];
			let strongs = htmlparser.DomUtils.find(function(node) {
				return node.name === "strong"
			}, [noStrong], true);
			/* TODO The following is intentionally commented because it reveals a case that *possibly* should be handled better in the generator */
			//assert(strongs.length === 0, `A '**' sequence in a table cell should have been ignored because the cell contains an HTML tag, but apparently was not ignored.\n\n${toHTML(noStrong)}`);

			let strong = tds[1];
			strongs = htmlparser.DomUtils.find(function(node) {
				return node.name === "strong"
			}, [strong], true);
			assert(strongs.length === 1, `A '**' sequence in a table cell should have generated as a <strong> since its cell does not contain any HTML tag but apparently did not\n\n${toHTML(strong)}`);

			let noList = tds[2];
			let listItems = htmlparser.DomUtils.find(function(node) {
				return node.name === "li"
			}, [noList], true);
			assert(listItems.length === 0, `Hyphens in a table cell should have been ignored because the cell contains an HTML tag, but apparently was not ignored.\n\n${toHTML(noList)}`);

			let list = tds[3];
			listItems = htmlparser.DomUtils.find(function(node) {
				return node.name === "li"
			}, [list], true);
			assert(listItems.length === 2, `Hyphens in a table cell should have generated as a two-item list since its cell does not contain any HTML tag but apparently did not\n\n${toHTML(list)}`);
		});

		it("Table with empty last cell", function() {
			let table = getElement(dom, "tableWithLastCellEmpty");
			let body = htmlparser.DomUtils.find(function(node) {
				return node.name === "tbody"
			}, [table], true);
			let trs = htmlparser.DomUtils.find(function(node) {
				return node.name === "tr"
			}, body, true);
			assert(trs.length === 2, `The table with a blank last cell did not generate with the expected number of rows (2).\n\n${toHTML(table)}`);
		});

		it("Table verify attributes placement", function() {
			let elements = htmlparser.DomUtils.find(function(node) {
				return (node.attribs || {}).class === "testTable"
			}, dom, true);
			let tablesCount = 0;
			elements.forEach(function(current) {
				if (current.name === "table") {
					tablesCount++;
				}
			});
			assert(tablesCount === 2, `There were ${tablesCount} tables with class .testTable instead of the expected 2, so table attributes are not being properly placed on the table element(s).`);
		});

		it("Table cell processing turned off", function() {
			let customOptions = { ...options };
			customOptions.processTableCellContent = false;
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let table = getElement(dom, "tableWithCellFormatting");
			let tds = htmlparser.DomUtils.find(function(node) {
				return node.name === "td"
			}, [table], true);
			let missingNewlines = 0;
			tds.forEach(function(td) {
				let newline = htmlparser.DomUtils.find(function(node) {
					return node.type === "text" && node.data.indexOf("\n") === 0;
				}, [td], true);
				if (!newline.length) {
					missingNewlines++;
				}
			});
			assert(missingNewlines === 4, `Processing of table cell content appears to have happened even though it should have been disabled via the "processTableCellContent" option.\n\n${toHTML(table)}`);
		});
	});

	describe('Variables', function() {
		it("Variable substitutions", function() {
			let customOptions = { ...options };
			customOptions.variablesMap = {
				"root-level": "Root-Level",
				"root-level-path": "Root-Level-Path",
				hierarchical: {label: {string: "Hierarchical"}}
			};
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let variablesString = getElement(dom, "variables");
			let resolvedString = variablesString.children[0].data;
			let expectedString = "This sentence has a Root-Level variable, a Root-Level-Path variable, a Hierarchical variable, a Front Matter variable and a {{missing}} one.";
			assert(resolvedString === expectedString, `Variable substitution did not give the expected result.\nExpected: ${expectedString}\nActual  : ${resolvedString}`);
		});

		it("Front matter processing turned off", function() {
			let customOptions = { ...options };
			customOptions.variablesMap = {
				"root-level": "Root-Level",
				"root-level-path": "Root-Level-Path",
				hierarchical: {label: {string: "Hierarchical"}}
			};
			customOptions.processFrontMatter = false;
			let result = markedIt.generate(sourceV2, customOptions);
			let html = result.html.text;
			let dom = htmlToDom(html);

			let variablesString = getElement(dom, "variables");
			let resolvedString = variablesString.children[0].data;
			let expectedString = "This sentence has a Root-Level variable, a Root-Level-Path variable, a Hierarchical variable, a {{front.matter}} variable and a {{missing}} one.";
			assert(resolvedString === expectedString, `Variable substitution did not give the expected result.\nExpected: ${expectedString}\nActual  : ${resolvedString}`);
		});
	});

	describe('Table of Contents (JSON)', function() {
		it("Validate Generation", function() {
			let toc = JSON.parse(returnedValue.jsonToc.text);
			assert(toc.toc.topics.length === 2, `There were ${toc.toc.topics.length} top-level topics generated but there should have been 2.\n\n${JSON.stringify(toc, null, 4)}`);
			let topTopic2 = toc.toc.topics[1];
			assert(topTopic2.topics.length === 6, `There were ${topTopic2.topics.length} topics generated under the second top-level topic but there should have been 6.\n\n${JSON.stringify(topTopic2.topics, null, 4)}`);
		})
		it("Validate Errors", function() {
			assert(returnedValue.jsonToc.errors.length === 1, "There were ${returnedValue.jsonToc.errors.length} TOC generation errors reported but there should have been 1 (invalid H6)");
		})
		it("Footnote excluded from TOC text", function() {
			let toc = JSON.parse(returnedValue.jsonToc.text);
			let topTopic2 = toc.toc.topics[1];
			let childTopics = topTopic2.topics;
			let re = /footnote.+$/;
			childTopics.forEach(function(current) {
				if (re.test(current.label)) {
					assert(false, `A header was found with trailing footnote characters: "${current.label}"`);
				}
			});
		})
	});

	describe('Indentation normalization', function() {
		// TODO
	});

    describe('Extensions', function() {
		const OUTPUT_GENERATED_HTML = false;
    	it('All HTML generation extensions', function() {
	    	let fd = fs.openSync('test/extensionsTest-source.md', "r");
	    	let mdText = readFile(fd);
	    	fs.closeSync(fd);

			function addChild(html, data) {
				let dom = data.htmlToDom(html)[0];
				let newChild = data.htmlToDom(`<child>Child for ${dom.name}</child>`);
				data.domUtils.appendChild(dom, newChild[0]);
				return data.domToHtml(dom);
			}

	    	let extensions = {
	    		html: {
					onHeading: addChild,
					onCode: addChild,
					onBlockquote: addChild,
					onHr: addChild,
					onList: addChild,
					onListItem: addChild,
					onParagraph: addChild,
					onTable: addChild,
					onTablerow: addChild,
					onTablecell: addChild,
					onStrong: addChild,
					onEmphasis: addChild,
					onCodespan: addChild,
					onDel: addChild,
					onLink: addChild,
					onImage: function(html, data) {
						/* img tags cannot have children so handle differently from the other element types */
						let dom = data.htmlToDom(html)[0];
						dom.attribs.title = `Title for ${dom.name}`;
						return data.domToHtml(dom);
					}
	    		}
	    	};

			let customOptions = { ...options };
			customOptions.variablesMap = {
				"root-level": "Root-Level",
				"root-level-path": "Root-Level-Path",
				hierarchical: {label: {string: "Hierarchical"}}
			};
			customOptions.extensions = extensions;

	    	let result = markedIt.generate(mdText, customOptions);
	    	if (OUTPUT_GENERATED_HTML) {
	    		console.log("-------------------------------\n" + result.html.text);
			}
			let dom = htmlToDom(result.html.text);

			let elementIds = [
				"h1-atx", "h2-atx", "h3-atx", "h4-atx", "h5-atx", "h6-atx", "h1-setext", "h2-setext",
				"strong1", "strong2", "emphasized1", "emphasized2",
				"codeblock", "codespan", "link1", "paragraph1",
				"blockquote", "ordered-list", "unordered-list", "image1",
				"table"
			];
			elementIds.forEach(function(id) {
				let element = htmlparser.DomUtils.getElementById(id, dom, true);
				assert(element, "Expected element found: #" + id);
				if (element.name === "img") {
					/* img tags cannot have children so handle differently from the other element types */
					assert(element.attribs.title.indexOf(element.name) !== -1, "Expected title text found for: #" + id);
				} else {
					let childChildren = htmlparser.DomUtils.find(function(child) {return child.name === "child"}, [element], true);
					assert(childChildren.length, "Expected extension-added child found for: #" + id);
					let found = false;
					childChildren.forEach(function(child) {
						if (child.children[0].data.indexOf(element.name) !== -1) {
							found = true;
						}
					});
					assert(found, "Expected child text found for: #" + id);
				}
			});
    	});
	});
});

function getElement(dom, id) {
	return htmlparser.DomUtils.getElementById(id, dom, true);
}

function toHTML(dom, includeOuter) {
	if (includeOuter) {
		return dom ? htmlparser.DomUtils.getOuterHTML(dom, {}) : "";
	} else {
		return dom ? htmlparser.DomUtils.getInnerHTML(dom, {}) : "";
	}
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
