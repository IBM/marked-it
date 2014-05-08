var fs = require('fs');
var path = require('path');
var marked = require('marked');

var EXTENSION_HTML = ".html";
var EXTENSION_MARKDOWN_REGEX = /\.md$/g;
var OPTIONS_MARKED = {sanitize: true, tables: true};
var SWITCH_SOURCEDIR = "--sourceDir", SWITCH_DESTDIR = "--destDir", SWITCH_BASEURL = "--baseURL", SWITCH_OVERWRITE = "-overwrite";

var sourceDir, destinationDir, baseURL, overwrite;

process.argv.forEach(function(arg) {
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
//	} else if (arg.indexOf(SWITCH_BASEURL) === 0 && arg.indexOf("=") !== -1) {
//		baseURL = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_OVERWRITE) === 0) {
		overwrite = true;
	}
});

if (!sourceDir || !destinationDir) {
	console.log("Usage: node mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [" /* + SWITCH_BASEURL + "=<baseURL>]["*/ + SWITCH_OVERWRITE + "]");
	process.exit();
}

if (!fs.existsSync(sourceDir)) {
	console.log("Source directory does not exist: " + sourceDir);
	process.exit();	
}

if (!fs.existsSync(destinationDir)) {
	var result = fs.mkdirSync(destinationDir);
	if (result) {
		console.log("Failed to create destination directory: " + destinationDir);
		console.log(result.toString());
		process.exit();	
	}
}

var writeStat = fs.statSync(destinationDir);
var writeBlockSize = writeStat.blksize || 4096;

if (baseURL) {
	marked.InlineLexer.prototype.outputLink = baseURL;
}

console.log("");
var filenames = fs.readdirSync(sourceDir);
filenames.forEach(function(current) {
	if (EXTENSION_MARKDOWN_REGEX.test(current)) {
		var sourcePath = path.join(sourceDir, current);
		fs.open(sourcePath, "r", null, function(readErr, readFd) {
			if (readErr) {
				console.log("Failed to open file to read: " + sourcePath + "\n" + readErr.toString());
			} else {
				var readStat = fs.fstatSync(readFd);
				var readBlockSize = readStat.blksize || 4096;
				var fileSize = readStat.size;
				var inBuffer = new Buffer(fileSize);
				var totalReadCount = 0;
				do {
					var length = Math.min(readBlockSize, fileSize - totalReadCount);
					var readCount = fs.readSync(readFd, inBuffer, totalReadCount, length, null);
					if (!readCount) {
						break;
					}
					totalReadCount += readCount;
				} while (totalReadCount < fileSize);
				if (totalReadCount !== fileSize) {
					console.log("Failed to read the full content of file " + sourcePath);
				} else {
					var fileText = inBuffer.toString("utf8", 0, inBuffer.length);
					var markdownText = marked(fileText, OPTIONS_MARKED);
					if (!markdownText) {
						console.log("Failed during conversion of markdown to HTML file " + sourcePath);
					}
					var outBuffer = new Buffer(markdownText);
					var outputFilename = current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML);
					var destinationPath = path.join(destinationDir, outputFilename);
					fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
						if (writeErr) {
							console.log("Failed to open file to write: " + sourcePath + "\n" + writeErr.toString());
						} else {
							var totalWriteCount = 0;
							do {
								length = Math.min(writeBlockSize, outBuffer.length - totalWriteCount);
								var writeCount = fs.writeSync(writeFd, outBuffer, totalWriteCount, length, null);
								if (!writeCount) {
									console.log("0-length write, running away" + destinationPath);
									break;
								}
								totalWriteCount += writeCount;
							} while (totalWriteCount < outBuffer.length);
							if (totalWriteCount !== outBuffer.length) {
								console.log("Failed to write the full content of file " + destinationPath);
							} else {
								console.log("-->Wrote " + destinationPath);
							}
							fs.close(writeFd);
						}
					});
				}
				fs.close(readFd);
			}
		});
	}
});
