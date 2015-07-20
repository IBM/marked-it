/*
 * To run from this directory: ../node_modules/mocha/bin/mocha
 */

var fs = require('fs');
var assert = require('assert');
//var mdProcessor = require('../mdProcessor');
var htmlGenerator = require('../htmlGenerator');

var OUTPUT_GENERATED_HTML = false;

describe('markdownProcessor tests', function() {

    before(function() {});
    beforeEach(function() {});
    afterEach(function() {});
    after(function() {});

    describe('testADL', function() {
    	var fd = fs.openSync('./test_ADL.md', "r");
    	var mdText = readFile(fd);
    	fs.close(fd);

    	var resultText = htmlGenerator.generate(mdText, true);
    	if (OUTPUT_GENERATED_HTML) {
    		console.log("-------------------------------\n" + resultText);
    	} else {
        	fd = fs.openSync('./expectedResult_ADL.html', "r");
        	var expectedText = readFile(fd);
        	fs.close(fd);
    		assert.strictEqual(resultText, expectedText);
    	}
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
