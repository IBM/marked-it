/*******************************************************************************
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var fs = require('fs');
var path = require('path');
var marked = require('marked');

var EXTENSION_HTML = ".html";
var EXTENSION_MARKDOWN = ".md";
var EXTENSION_MARKDOWN_REGEX = /\.md$/gi;
var OPTIONS_MARKED = {sanitize: true, tables: true, headerPrefix: ""};
var SWITCH_SOURCEDIR = "--sourceDir";
var SWITCH_DESTDIR = "--destDir";
var SWITCH_BASEURL = "--baseURL";
var SWITCH_OVERWRITE = "-overwrite";
var SWITCH_ATTRIBUTES = "-enableAttributes";
var SWITCH_HEADERFILE = "--headerFile";
var SWITCH_FOOTERFILE = "--footerFile";
var COPY_EXTENSIONS = [EXTENSION_HTML, ".css", ".bmp", ".jpg", ".png", ".gif", ".svg"];

var sourceDir, destinationDir, baseURL, overwrite, enableAttributes, headerFile, footerFile, headerText, footerText;

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
		enableAttributes = true;
	} else if (arg.indexOf(SWITCH_HEADERFILE) === 0 && arg.indexOf("=") !== -1) {
		headerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_FOOTERFILE) === 0 && arg.indexOf("=") !== -1) {
		footerFile = arg.substring(arg.indexOf("=") + 1);
	} else {
		/* don't display errors for the first two args (the node executable and .js file) */
		if (switchCounter > 2) {
			console.log("*** Ignoring unknown command-line switch: " + arg);
		}
	}
});

if (!sourceDir || !destinationDir) {
	console.log("\nUsage:\n\tnode mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [" + "\n\t\t" + SWITCH_OVERWRITE + "\n\t\t" + SWITCH_ATTRIBUTES + "\n\t\t" + SWITCH_HEADERFILE + "=<headerSourceFile>" + "\n\t\t" + SWITCH_FOOTERFILE + "=<footerSourceFile>" + "\n\t]");
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

var writeStat = fs.statSync(destinationDir);
var writeBlockSize = writeStat.blksize || 4096;

if (baseURL) {
	marked.InlineLexer.prototype.outputLink = baseURL;
}

if (enableAttributes) {
	/* ---------- the custom generation code is in this block ---------- */

	function escape(html, encode) { // copied from marked.js
		return html
			.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function unescape(html) {
		return html
			.replace(/&amp;/g, '&(?!#?\w+;)')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
	}

	var customRenderer = new marked.Renderer();
	customRenderer.blockquote = function(quote) {
		/*
		 * Since blockquote is a container element, use it as an opportunity to define arbitrary kinds of
		 * container elements by looking for the "elementKind" attribute.  This is very hacky, an alternative
		 * would be an extension to markdown's syntax, but will do this for now as a proof-of-concept.
		 */
		var elementName = "blockquote";
		var attributesRegex = /<p>{:(.+)}<\/p>\n/;
		var match = attributesRegex.exec(quote);
		if (match) {
			/* found attributes */
			quote = quote.replace(match[0], "").trim();
			var attributes = unescape(match[1]);
			var kindOfRegex = /elementKind=(['"])([^\1]+?)\1/;
			match = kindOfRegex.exec(attributes);
			if (match) {
				/* found an elementKind attribute, which is handled specially */
				elementName = match[2];
				attributes = attributes.replace(match[0], "").trim();
			}
			return "<" + elementName + " " + attributes + ">\n" + quote + "\n<" + elementName + ">\n";
		}

		/* no attributes to handle, so just return the default renderer's text */
		return marked.Renderer.prototype.blockquote.call(this, quote);
	};
	customRenderer.heading = function(text, level, raw) {
		var attributeStartIndex = raw.lastIndexOf("{:");
		if (attributeStartIndex !== -1) {
			var endIndex = raw.lastIndexOf("}");
			if (endIndex === raw.length - 1) {
				/* found attributes */
				var attributes = " " + raw.substring(attributeStartIndex + 2, raw.length - 1);
				raw = raw.substring(0, attributeStartIndex);
				text = escape(raw);
			}
		}

		var result = marked.Renderer.prototype.heading.call(this, text, level, raw);
		if (attributes) {
			/* hacky, making an assumption about the shape of the result string from the default renderer */
			result = result.substring(0, 3) + attributes + result.substring(3);
		}
		return result;
	};

	OPTIONS_MARKED.renderer = customRenderer;
}

var lexer = new marked.Lexer(OPTIONS_MARKED);
var parser = new marked.Parser(OPTIONS_MARKED);

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
								var tokens = lexer.lex(fileText, OPTIONS_MARKED);
								var markdownText = parser.parse(tokens);
								if (!markdownText) {
									console.log("*** Failed during conversion of markdown to HTML file " + sourcePath);
								} else {
									var outBuffer = new Buffer(markdownText);
									fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
										if (writeErr) {
											console.log("*** Failed to open file to write: " + sourcePath + "\n" + writeErr.toString());
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
					fs.open(sourcePath, "r", null, function(readErr, readFd) {
						if (readErr) {
							console.log("Failed to open file to read: " + sourcePath + "\n" + readErr.toString());
						} else {
							var fileText = readFile(readFd);
							if (!fileText) {
								console.log("Failed to read " + sourcePath);
							} else {
								var outBuffer = new Buffer(fileText);
								fs.open(destinationPath, overwrite ? "w" : "wx", null, function(writeErr, writeFd) {
									if (writeErr) {
										console.log("Failed to open file to write: " + sourcePath + "\n" + writeErr.toString());
									} else {
										var success = writeFile(writeFd, outBuffer);										
										if (success) {
											console.log("-->Copied: " + sourcePath);
										} else {
											console.log("Failed to write " + destinationPath);
										}
										fs.close(writeFd);
									}
								});
								
							}
							fs.close(readFd);
						}
					});
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
