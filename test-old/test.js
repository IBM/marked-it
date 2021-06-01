/**
 * marked-it
 *
 * Copyright (c) 2014, 2017 IBM Corporation
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

var fs = require('fs');
var assert = require('assert');
var markedIt = require('../lib/marked-it');

describe('markdownProcessor tests', function() {

    before(function() {});
    beforeEach(function() {});
    afterEach(function() {});
    after(function() {});

    describe('testADL', function() {
		var OUTPUT_GENERATED_HTML = false;
    	it('doit', function() {
	    	var fd = fs.openSync('test/test_ADL.md', "r");
	    	var mdText = readFile(fd);
	    	fs.close(fd);
	
	    	var result = markedIt.generate(mdText, {});
	    	if (OUTPUT_GENERATED_HTML) {
	    		console.log("-------------------------------\n" + result.html.text);
	    	} else {
	        	fd = fs.openSync('test/expectedResult_ADL.html', "r");
	        	var expectedText = readFile(fd);
	        	fs.close(fd);
	    		assert.strictEqual(result.html.text, expectedText);
	    	}
    	});
    });

    describe('testExtensions', function() {
		var OUTPUT_GENERATED_HTML = false;
    	it('doit', function() {
	    	var fd = fs.openSync('test/test_extensions.md', "r");
	    	var mdText = readFile(fd);
	    	fs.close(fd);

			function checkData(data) {
				assert(data.htmlToDom && typeof data.htmlToDom === "function");
				assert(data.domToHtml && typeof data.domToHtml === "function");
				assert(data.domToInnerHtml && typeof data.domToInnerHtml === "function");
				assert(data.domUtils && typeof data.domUtils === "object");
			}

			var extensions = {
				html: {
					onHeading: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)h(\\d)", "g"), "<$1header-repl$2");
					},
					onCode: function(source, data) {
						checkData(data);
						return source
							.replace(new RegExp("<(/?)pre>", "g"), "<$1pre-repl>")
							.replace(new RegExp("<(/?)code>", "g"), "<$1code-repl>");
					},
					onBlockquote: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)blockquote", "g"), "<$1blockquote-repl");
					},
					onHtml: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("([<>])", "g"), "$1$1$1");
					},
					onHr: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)hr", "g"), "<$1hr-repl");
					},
					onList: function(source, data) {
						checkData(data);
						return source
							.replace(new RegExp("<(/?)ul", "g"), "<$1ul-repl")
							.replace(new RegExp("<(/?)ol", "g"), "<$1ol-repl");
					},
					onListItem: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)li", "g"), "<$1li-repl");
					},
					onParagraph: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)p", "g"), "<$1p-repl");
					},
					onTable: function(source, data) {
						checkData(data);
						return source
							.replace(new RegExp("<(/?)table", "g"), "<$1table-repl")
							.replace(new RegExp("<(/?)thead", "g"), "<$1thead-repl")
							.replace(new RegExp("<(/?)tbody", "g"), "<$1tbody-repl");
					},
					onTablerow: function(source, data) {
						checkData(data);
						return source
							.replace(new RegExp("<(/?)tr", "g"), "<$1tr-repl")
							.replace(new RegExp("<(/?)th", "g"), "<$1th-repl");
					},
					onTablecell: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)td", "g"), "<$1td-repl");
					},
					
					onStrong: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)strong", "g"), "<$1strong-repl");
					},
					onEmphasis: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)em", "g"), "<$1em-repl");
					},
					onCodespan: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)code", "g"), "<$1code-repl");
					},
					onLinebreak: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)br", "g"), "<$1br-repl");
					},
					onDel: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)del", "g"), "<$1del-repl");
					},
					onLink: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)a", "g"), "<$1a-repl");
					},
					onImage: function(source, data) {
						checkData(data);
						return source.replace(new RegExp("<(/?)img", "g"), "<$1img-repl");
					}
				}
			};
			
	    	var result = markedIt.generate(mdText, {extensions: extensions});
	    	if (OUTPUT_GENERATED_HTML) {
	    		console.log("-------------------------------\n" + result.html.text);
	    	} else {
	        	fd = fs.openSync('test/expectedResult_extensions.html', "r");
	        	var expectedText = readFile(fd);
	        	fs.close(fd);
	    		assert.strictEqual(result.html.text, expectedText);
	    	}
    	});
    });

//    describe('testBlockIAL', function() {
//		var OUTPUT_GENERATED_HTML = false;
//    	var fd = fs.openSync('./test_block_IAL.md', "r");
//    	var mdText = readFile(fd);
//    	fs.close(fd);
//
//    	var resultText = htmlGenerator.generate(mdText, true);
//    	if (OUTPUT_GENERATED_HTML) {
//    		console.log("-------------------------------\n" + resultText);
//    	} else {
//			fd = fs.openSync('./expectedResult_block_IAL.html', "r");
//			var expectedText = readFile(fd);
//			fs.close(fd);
//    		assert.strictEqual(resultText, expectedText);
//    	}
//    });    
//
//    describe('testSpanIAL', function() {
//		var OUTPUT_GENERATED_HTML = false;
//    	var fd = fs.openSync('./test_span_IAL.md', "r");
//    	var mdText = readFile(fd);
//    	fs.close(fd);
//
//    	var resultText = htmlGenerator.generate(mdText, true);
//    	if (OUTPUT_GENERATED_HTML) {
//    		console.log("-------------------------------\n" + resultText);
//    	} else {
//			fd = fs.openSync('./expectedResult_span_IAL.html', "r");
//			var expectedText = readFile(fd);
//			fs.close(fd);
//    		assert.strictEqual(resultText, expectedText);
//    	}
//    });
    
//    describe('testVariables', function() {
//		var OUTPUT_GENERATED_HTML = false;
//    	var fd = fs.openSync('./test_variables.md', "r");
//    	var mdText = readFile(fd);
//    	fs.close(fd);
//
//    	var resultText = htmlGenerator.generate(mdText, true);
//    	if (OUTPUT_GENERATED_HTML) {
//    		console.log("-------------------------------\n" + resultText);
//    	} else {
//        	fd = fs.openSync('./mdProcessor.html', "r");
//        	var expectedText = readFile(fd);
//        	fs.close(fd);
//    		assert.strictEqual(resultText, expectedText);
//    	}
//    });
});

function readFile(fd) {
	var readStat = fs.fstatSync(fd);
	var readBlockSize = readStat.blksize || 4096;
	var fileSize = readStat.size;
	if (!fileSize) {
		return "";
	}
	var inBuffer = Buffer.alloc(fileSize);
	var totalReadCount = 0;
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
