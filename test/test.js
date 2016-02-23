/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

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
