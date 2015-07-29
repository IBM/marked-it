/*******************************************************************************
 * Copyright (c) 2014, 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var fs = require("fs");
var path = require("path");
var htmlGenerator = require("./htmlGenerator");
var tocBuilder = require('./tocBuilder');

var EXTENSION_DITAMAP = ".ditamap";
var EXTENSION_HTML = ".html";
var EXTENSION_MARKDOWN = ".md";
var EXTENSION_MARKDOWN_REGEX = /\.md$/gi;
var SWITCH_SOURCEDIR = "--sourceDir";
var SWITCH_DESTDIR = "--destDir";
var SWITCH_BASEURL = "--baseURL";
var SWITCH_OVERWRITE = "-overwrite";
var SWITCH_ATTRIBUTES = "-disableAttributes";
var SWITCH_TOC = "-disableTOC";
var SWITCH_HEADERFILE = "--headerFile";
var SWITCH_FOOTERFILE = "--footerFile";
var SWITCH_CONREFFILE = "--conrefFile";
var COPY_EXTENSIONS = [EXTENSION_HTML, ".css", ".bmp", ".jpg", ".png", ".gif", ".svg"];

var sourceDir, destinationDir, baseURL, overwrite, disableAttributes, disableTOC, headerFile, footerFile, headerText, footerText;
var conrefFile, conrefMap;

var switchCounter = 0;
process.argv.forEach(function(arg) {
	switchCounter++;
	if (arg.indexOf(SWITCH_SOURCEDIR) === 0 && arg.indexOf("=") !== -1) {
		sourceDir = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_DESTDIR) === 0 && arg.indexOf("=") !== -1) {
		destinationDir = arg.substring(arg.indexOf("=") + 1);
//	} else if (arg.indexOf(SWITCH_BASEURL) === 0 && arg.indexOf("=") !== -1) {
//		baseURL = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_OVERWRITE) === 0) {
		overwrite = true;
	} else if (arg.indexOf(SWITCH_ATTRIBUTES) === 0) {
		disableAttributes = true;
	} else if (arg.indexOf(SWITCH_TOC) === 0) {
		disableTOC = true;
	} else if (arg.indexOf(SWITCH_HEADERFILE) === 0 && arg.indexOf("=") !== -1) {
		headerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_FOOTERFILE) === 0 && arg.indexOf("=") !== -1) {
		footerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_CONREFFILE) === 0 && arg.indexOf("=") !== -1) {
		conrefFile = arg.substring(arg.indexOf("=") + 1);
	} else {
		/* don't display errors for the first two args (the node executable and .js file) */
		if (switchCounter > 2) {
			console.log("*** Ignoring unknown command-line switch: " + arg);
		}
	}
});

if (!sourceDir || !destinationDir) {
	console.log("\nUsage:\n\tnode mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [" + "\n\t\t" + SWITCH_OVERWRITE + "\n\t\t" + SWITCH_ATTRIBUTES + "\n\t\t" + SWITCH_TOC + "\n\t\t" + SWITCH_HEADERFILE + "=<headerSourceFile>" + "\n\t\t" + SWITCH_FOOTERFILE + "=<footerSourceFile>" + "\n\t]");
	process.exit();
}

if (!fs.existsSync(sourceDir)) {
	console.log("*** Source directory does not exist: " + sourceDir);
	process.exit();	
}

if (!fs.existsSync(destinationDir)) {
	var result = fs.mkdirSync(destinationDir);
	if (result) {
		console.log("*** Failed to create destination directory: " + destinationDir);
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
	fd = fs.openSync(footerFile, "r");
	footerText = readFile(fd);
	fs.close(fd);
}

if (conrefFile) {
	var read = require("read-yaml");
	conrefMap = read.sync(conrefFile);
}

var writeStat = fs.statSync(destinationDir);
var writeBlockSize = writeStat.blksize || 4096;

function traverse_tree(source, destination) {
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
				var outputFilename = current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML);
				var destinationPath = path.join(destination, outputFilename);
				var extension = path.extname(current).toLowerCase();
				if (extension === EXTENSION_MARKDOWN) {
					fs.open(sourcePath, "r", null, function(readErr, readFd) {
						if (readErr) {
							console.log("*** Failed to open file to read: " + sourcePath + "\n" + readErr.toString());
						} else {
							var fileText = readFile(readFd);
							if (!fileText) {
								console.log("*** Failed to read " + sourcePath);
							} else {
								if (conrefMap) {
									fileText = replaceVariables(fileText);
								}
								tocBuilder.reset();
								var markdownText = htmlGenerator.generate(fileText, tocBuilder, !disableAttributes, baseURL);
								if (!markdownText) {
									console.log("*** Failed during conversion of markdown to HTML file " + sourcePath);
								} else {
									var outBuffer = new Buffer(markdownText);
									fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
										if (writeErr) {
											console.log("*** Failed to open file to write: " + destinationPath + "\n" + writeErr.toString());
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
												console.log("--> Wrote: " + destinationPath);

												var tocStr = tocBuilder.buffer();
												if (!disableTOC && tocStr) {
													var tocFilename = path.join(destination, current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_DITAMAP));
													fs.open(tocFilename, overwrite ? 'w' : 'wx', null, function(writeErr, writeFd) {
														if (writeErr) {
															console.log('*** Failed to open file to write: ' + tocFilename + '\n' + writeErr);
														} else {
															if (writeFile(writeFd, new Buffer(tocStr))) {
																console.log('--> Wrote: ' + tocFilename);
															} else {
																console.log('*** Failed to write: ' + tocFilename);
															}
															fs.close(writeFd);
														}
													});
												}
											} else {
												console.log("*** Failed to write: " + destinationPath);
											}
											fs.close(writeFd);
										}
									});
								}
							}
							fs.close(readFd);
						}
					});
				} else if (COPY_EXTENSIONS.indexOf(extension) !== -1) {
					var readStream = fs.createReadStream(sourcePath);
					readStream.on("error", function(error) {
						console.log("Failed to read " + sourcePath + "\n" + error.toString());
					});
					var writeStream = fs.createWriteStream(destinationPath);
					writeStream.on("error", function(error) {
						console.log("Failed to write: " + destinationPath + "\n" + error.toString());
					});
					writeStream.on("close", function() {
						console.log("-->Copied: " + sourcePath);
					});
					readStream.pipe(writeStream);
				} else {
					console.log("--> Skipped: " + sourcePath);
				}
			}
		});
	});
}

console.log("");
traverse_tree(sourceDir, destinationDir);

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

function replaceVariables(text) { /* conref variables */
	var VAR_OPEN = "{{";
	var VAR_CLOSE = "}}";
	var SITEDATA = "site.data.";
	
	var result = "";
	var pos = 0;

	var index = text.indexOf(VAR_OPEN);	
	while (index !== -1) {
		result += text.substring(pos, index);
		pos = index;

		var endIndex = text.indexOf(VAR_CLOSE, index + VAR_OPEN.length);
		if (endIndex === -1) {
			result += text.substring(pos);
			pos = text.length;
			break;
		}

		var key = text.substring(index + VAR_OPEN.length, endIndex).trim();
		var value = "";
		if (key.indexOf(SITEDATA) === 0) {
			key = key.substring(SITEDATA.length);
			value = key.split(".").reduce(
				function get(result, currentKey) {
					return result[currentKey];
				},
				conrefMap);
		}
		if (value) {
			/*
			 * If a value was found then substitute it in-place in text rather than putting it right
			 * into result, in order to support variables that resolve to other variables.
			 */
			text = value + text.substring(endIndex + VAR_CLOSE.length);
			pos = 0;
			index = 0;
		} else {
			/*
			 * A value was not found, just treat it as plaintext that will be appended to result later.
			 */
			index = endIndex + VAR_CLOSE.length;
		}
		index = text.indexOf(VAR_OPEN, index);
	}
	result += text.substring(pos);
	return result;
}
