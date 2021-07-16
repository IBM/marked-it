/**
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

const assert = require('assert');
const { domUtils } = require('../lib/common');
const fs = require('fs');
const highlightJs = require("highlight.js");
const htmlparser = require("htmlparser2");
const markedIt = require('../lib/marked-it');

describe('markdownProcessor tests', function() {

    before(function() {});
    beforeEach(function() {});
    afterEach(function() {});
	after(function() {});
	
	function getOptions() {
		const OPTIONS_MARKED = {
			tables: true,
			gfm: true,
			headerPrefix: "",
			xhtml: true,
			langPrefix: "lang-",
			highlight: function(str, lang) {
			    if (lang && highlightJs.getLanguage(lang)) {
			        try {
			            return highlightJs.highlight(str, { language: lang }).value;
			        } catch (e) {
			            return null;
			        }
			    }
			    return '';
			}
		};
		const OPTIONS_MARKDOWNIT = {
		    html: true,
		    linkify: true,
		    highlight: OPTIONS_MARKED.highlight
		};
		let version = process.env.VERSION === "2" ? 2 : 1;
		return {
			"version": version,
			"markedOptions": version === 2 ? OPTIONS_MARKDOWNIT : OPTIONS_MARKED
		};
	}

    describe('extensionsTest', function() {
		const OUTPUT_GENERATED_HTML = false;
    	it('extensionsTest', function() {
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

			let options = getOptions();
			options.extensions = extensions;
	    	let result = markedIt.generate(mdText, options);
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
