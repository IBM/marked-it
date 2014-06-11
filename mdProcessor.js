var fs = require('fs');
var path = require('path');
var marked = require('marked');

var EXTENSION_HTML = ".html";
var EXTENSION_MARKDOWN_REGEX = /\.md$/g;
var OPTIONS_MARKED = {sanitize: true, tables: true};
var SWITCH_SOURCEDIR = "--sourceDir";
var SWITCH_DESTDIR = "--destDir";
var SWITCH_BASEURL = "--baseURL";
var SWITCH_OVERWRITE = "-overwrite";
var SWITCH_HEADERFILE = "--headerFile";
var SWITCH_FOOTERFILE = "--footerFile";

var sourceDir, destinationDir, baseURL, overwrite, headerFile, footerFile, headerText, footerText;

process.argv.forEach(function(arg) {
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
//	} else if (arg.indexOf(SWITCH_BASEURL) === 0 && arg.indexOf("=") !== -1) {
//		baseURL = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_OVERWRITE) === 0) {
		overwrite = true;
	} else if (arg.indexOf(SWITCH_HEADERFILE) === 0 && arg.indexOf("=") !== -1) {
		headerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_FOOTERFILE) === 0 && arg.indexOf("=") !== -1) {
		footerFile = arg.substring(arg.indexOf("=") + 1);
	}
});

if (!sourceDir || !destinationDir) {
	console.log("Usage: node mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [" /* + SWITCH_BASEURL + "=<baseURL>]["*/ + SWITCH_OVERWRITE + " " + SWITCH_HEADERFILE + "=<headerSourceFile> " + SWITCH_FOOTERFILE + "=<footerSourceFile>]");
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

if (headerFile) {
	var fd = fs.openSync(headerFile, "r");
	headerText = readFile(fd);
	fs.close(fd);
}

if (footerFile) {
	var fd = fs.openSync(footerFile, "r");
	footerText = readFile(fd);
	fs.close(fd);
}

var writeStat = fs.statSync(destinationDir);
var writeBlockSize = writeStat.blksize || 4096;

if (baseURL) {
	marked.InlineLexer.prototype.outputLink = baseURL;
}

var readFile = function(fd) {
	var readStat = fs.fstatSync(fd);
	var readBlockSize = readStat.blksize || 4096;
	var fileSize = readStat.size;
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
};

var writeFile = function(fd, buffer) {
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
};

var traverse_tree = function(source, destination) {
	var filenames = fs.readdirSync(source);
	filenames.forEach(function(current) {
		var sourcePath = path.join(source, current);
		fs.stat(sourcePath, function(err, stat) {
			if (stat && stat.isDirectory()) {
				var destPath = path.join(destination, current);
				fs.stat(destPath, function (err, stat) {
					if (!stat) {
						fs.mkdir(destPath, function (err) {});
					}
				});
				traverse_tree(sourcePath, destPath);
			} else {
				if (path.extname(current) === ".md") {
					fs.open(sourcePath, "r", null, function(readErr, readFd) {
						if (readErr) {
							console.log("Failed to open file to read: " + sourcePath + "\n" + readErr.toString());
						} else {
							var fileText = readFile(readFd);
							if (!fileText) {
								console.log("Failed to read " + sourcePath);
							} else {
								var markdownText = marked(fileText, OPTIONS_MARKED);
								if (!markdownText) {
									console.log("Failed during conversion of markdown to HTML file " + sourcePath);
								} else {
									var outBuffer = new Buffer(markdownText);
									var outputFilename = current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML);
									var destinationPath = path.join(destination, outputFilename);
									fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
										if (writeErr) {
											console.log("Failed to open file to write: " + sourcePath + "\n" + writeErr.toString());
										} else {
											var success = true;
											if (headerText) {
												success = writeFile(writeFd, new Buffer(headerText));
											}
											if (success) {
												success = writeFile(writeFd, outBuffer);
											}
											if (success && footerText) {
												success = writeFile(writeFd, new Buffer(footerText));
											}
											if (success) {
												console.log("-->Wrote " + destinationPath);
											} else {
												console.log("Failed to write " + destinationPath);
											}
											fs.close(writeFd);
										}
									});
								}
							}
							fs.close(readFd);
						}
					});
				} else {
					console.log("file " + sourcePath + " is not a markdown");
				}
			}
		});
	});
}

console.log("");
traverse_tree(sourceDir, destinationDir);
