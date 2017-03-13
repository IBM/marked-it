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
var htmlGenerator = require('../lib/htmlGenerator');

var OUTPUT_GENERATED_HTML = false;

describe('markdownProcessor tests', function() {

    before(function() {});
    beforeEach(function() {});
    afterEach(function() {});
    after(function() {});

    describe('testADL', function() {
    	it('doit', function() {
	    	var fd = fs.openSync('test/test_ADL.md', "r");
	    	var mdText = readFile(fd);
	    	fs.close(fd);
	
	    	var resultText = htmlGenerator.generate(mdText, true);
	    	if (OUTPUT_GENERATED_HTML) {
	    		console.log("-------------------------------\n" + resultText);
	    	} else {
	        	fd = fs.openSync('test/expectedResult_ADL.html', "r");
	        	var expectedText = readFile(fd);
	        	fs.close(fd);
	    		assert.strictEqual(resultText, expectedText);
	    	}
    	});
    });
    
//    describe('testBlockIAL', function() {
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
	var inBuffer = new Buffer(fileSize);
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
