var fs = require("fs");
var htmlparser = require("htmlparser2");

function htmlToDom(string) {
	var result;
	var handler = new htmlparser.DomHandler(function(error, dom) {
	    if (error) {
	        console.log("*** Failed to parse HTML:\n" + error.toString());
	    } else {
	        result = dom;
	    }
	});
	var parser = new htmlparser.Parser(handler);
	parser.write(string.trim());
	parser.done();

	return result[0];
}

function domToHtml(dom) {
	return htmlparser.DomUtils.getOuterHTML(dom);
}

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

function writeFile(fd, buffer) {
	var writeStat = fs.fstatSync(fd);
	var writeBlockSize = writeStat.blksize || 4096;
	var totalWriteCount = 0;
	do {
		var length = Math.min(writeBlockSize, buffer.length - totalWriteCount);
		var writeCount = fs.writeSync(fd, buffer, totalWriteCount, length, null);
		if (!writeCount) {
			return false;
		}
		totalWriteCount += writeCount;
	} while (totalWriteCount < buffer.length);
	return true;
}

module.exports.htmlToDom = htmlToDom;
module.exports.domToHtml = domToHtml;
module.exports.readFile = readFile;
module.exports.writeFile = writeFile;
