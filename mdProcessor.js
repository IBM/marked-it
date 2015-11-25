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
var htmlGenerator = require("./libs/htmlGenerator");
var mdTOCGenerator = require("./libs/mdTOCGenerator");
var ditamapGenerator = require("./libs/ditamapGenerator");
var pdfGenerator = require("./libs/pdfGenerator");
var common = require("./libs/common");

var EXTENSION_DITAMAP = ".ditamap";
var EXTENSION_HTML = ".html";
var EXTENSION_HTML_REGEX = /\.html$/;
var EXTENSION_HTML_TOC = "TOC.html";
var EXTENSION_MARKDOWN = ".md";
var EXTENSION_PDF = ".pdf";
var EXTENSION_MARKDOWN_TOC = "TOC.md";
var EXTENSION_MARKDOWN_REGEX = /\.md$/gi;
var SWITCH_SOURCEDIR = "--sourceDir";
var SWITCH_DESTDIR = "--destDir";
var SWITCH_BASEURL = "--baseURL";
var SWITCH_OVERWRITE = "-overwrite";
var SWITCH_ATTRIBUTES = "-disableAttributes";
var SWITCH_PDF = "-disablePDF";
var SWITCH_TOC = "-disableTOC";
var SWITCH_PDFSETTINGSFILE = "--pdfSettingsFile";
var SWITCH_HEADERFILE = "--headerFile";
var SWITCH_FOOTERFILE = "--footerFile";
var SWITCH_CONREFFILE = "--conrefFile";
var COPY_EXTENSIONS = [EXTENSION_HTML, EXTENSION_PDF, ".css", ".bmp", ".jpg", ".png", ".gif", ".svg", ".js", ".txt", ".xml", ".json"];
var DEFAULT_PDFSETTINGS = {};
var TIMEOUT_PDF = 1000;

var sourceDir, destinationDir, baseURL, overwrite, disableAttributes, disableTOC;
var headerFile, headerText;
var footerFile, footerText;
var disablePDF, pdfSettingsFile, pdfSettings;
var conrefFile, conrefMap;
var pdfQueue = [];

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
	} else if (arg.indexOf(SWITCH_PDF) === 0) {
		disablePDF = true;
	} else if (arg.indexOf(SWITCH_PDFSETTINGSFILE) === 0 && arg.indexOf("=") !== -1) {
		pdfSettingsFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_HEADERFILE) === 0 && arg.indexOf("=") !== -1) {
		headerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_FOOTERFILE) === 0 && arg.indexOf("=") !== -1) {
		footerFile = arg.substring(arg.indexOf("=") + 1);
	} else if (arg.indexOf(SWITCH_PDFSETTINGSFILE) === 0 && arg.indexOf("=") !== -1) {
		pdfSettingsFile = arg.substring(arg.indexOf("=") + 1);
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
	outputHelpPage();
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

var fd = null;
if (headerFile) {
	try {
		fd = fs.openSync(headerFile, "r");
	} catch (e) {
		console.log("*** Failed to open file to read: " + headerFile + "\n" + e.toString());
	}
	
	if (fd) {
		headerText = common.readFile(fd);
		fs.close(fd);
	}
}

if (footerFile) {
	fd = null;
	try {
		fd = fs.openSync(footerFile, "r");
	} catch (e) {
		console.log("*** Failed to open file to read: " + footerFile + "\n" + e.toString());
	}
	
	if (fd) {
		footerText = common.readFile(fd);
		fs.close(fd);
	}
}

if (!disablePDF) {
	if (pdfSettingsFile) {
		fd = null;
		try {
			fd = fs.openSync(pdfSettingsFile, "r");
		} catch (e) {
			console.log("*** Failed to open file to read " + pdfSettingsFile + ", will use default pdf generation settings.\n" + (e.code === "ENOENT" ? "" : e.toString()));
		}

		if (fd) {
			try {
				var content = common.readFile(fd);
				pdfSettings = JSON.parse(content);
			} catch (e) {
				console.log("*** Failed to parse pdf settings file " + pdfSettingsFile + ", will use default pdf generation settings.\n" + e.toString());
			}
			fs.close(fd);
		}
	}

	pdfSettings = pdfSettings || DEFAULT_PDFSETTINGS;
}

if (conrefFile) {
	var read = require("read-yaml");
	conrefMap = read.sync(conrefFile);
}

function traverse_tree(source, destination) {
	var filenames = fs.readdirSync(source);
	for (var i = 0; i < filenames.length; i++) {
		var current = filenames[i];
		var sourcePath = path.join(source, current);
		try {
			var stat = fs.statSync(sourcePath);
		} catch (e) {
			console.log("*** Failed to stat: " + sourcePath + "\n" + e.toString());
			continue;
		}
		
		if (stat.isDirectory()) {
			var destPath = path.join(destination, current);
			try {
				var dirStat = fs.statSync(destPath);
			} catch (e) {
				fs.mkdir(destPath, function (err) {});
			}
			traverse_tree(sourcePath, destPath);
		} else {
			var outputFilename = current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML);
			var destinationPath = path.join(destination, outputFilename);
			var extension = path.extname(current).toLowerCase();
			if (extension === EXTENSION_MARKDOWN) {
				try {
					var readFd = fs.openSync(sourcePath, "r");
				} catch (e) {
					console.log("*** Failed to open file to read: " + sourcePath + "\n" + e.toString());
					continue;
				}
				
				var fileText = common.readFile(readFd);
				fs.close(readFd);
				if (!fileText) {
					console.log("*** Failed to read " + sourcePath);
					continue;
				}

				if (conrefMap) {
					fileText = replaceVariables(fileText);
				}
				mdTOCGenerator.reset(outputFilename);
				var markdownText = htmlGenerator.generate(fileText, !disableAttributes, baseURL, disableTOC ? null : mdTOCGenerator);
				if (!markdownText) {
					console.log("*** Failed during conversion of markdown to HTML file " + sourcePath);
					continue;
				}

				var htmlOutput = "";
				if (headerText) {
					htmlOutput += headerText;
				} else {
					htmlOutput += "<html><body>";
				}
				htmlOutput += markdownText;
				if (footerText) {
					htmlOutput += footerText;
				} else {
					htmlOutput += "</body></html>";
				}

				try {
					var writeHTMLFd = fs.openSync(destinationPath, overwrite ? "w" : "wx");
				} catch (e) {
					console.log("*** Failed to open file to write: " + destinationPath + "\n" + e.toString());
					continue;
				}
				var success = common.writeFile(writeHTMLFd, new Buffer(htmlOutput));
				fs.close(writeHTMLFd);
				if (!success) {
					console.log("*** Failed to write: " + destinationPath);
					continue;
				}
				
				console.log("--> Wrote: " + destinationPath);

				if (pdfSettings) {
					generatePDF(fs.realpathSync(destinationPath));
				}

				if (!disableTOC) {
					var mdTOC = mdTOCGenerator.buffer();
					if (!mdTOC) {
						continue;
					}

					var tocFilename = path.join(destination, current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_MARKDOWN_TOC));
					try {
						var writeTOCFd = fs.openSync(tocFilename, overwrite ? "w" : "wx");
					} catch (e) {
						console.log("*** Failed to open file to write: " + tocFilename + "\n" + e.toString());
						continue;
					}

					success = common.writeFile(writeTOCFd, new Buffer(mdTOC));
					fs.close(writeTOCFd);
					if (!success) {
						console.log("*** Failed to write: " + tocFilename);
						continue;
					}

					console.log("--> Wrote: " + tocFilename);
					ditamapGenerator.reset();
					var htmlTOC = htmlGenerator.generate(mdTOC, !disableAttributes, baseURL, ditamapGenerator);
					if (!htmlTOC) {
						console.log("*** Failed during conversion of markdown TOC to ditamap file " + tocFilename);
						continue;
					}

					var ditamap = ditamapGenerator.buffer();
					if (!ditamap) {
						continue;
					}

					var ditamapFilename = path.join(destination, current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_DITAMAP));
					try {
						var writeDitamapFd = fs.openSync(ditamapFilename, overwrite ? "w" : "wx");
					} catch (e) {
						console.log("*** Failed to open file to write: " + ditamapFilename + "\n" + e.toString());
						continue;
					}

					success = common.writeFile(writeDitamapFd, new Buffer(ditamap));
					fs.close(writeDitamapFd);
					if (!success) {
						console.log("*** Failed to write: " + ditamapFilename);
					}
					
					console.log("--> Wrote: " + ditamapFilename);
					var htmlTOCFilename = path.join(destination, current.replace(EXTENSION_MARKDOWN_REGEX, EXTENSION_HTML_TOC));
					try {
						var writeHtmlTOCFd = fs.openSync(htmlTOCFilename, overwrite ? "w" : "wx");
					} catch (e) {
						console.log("*** Failed to open file to write: " + htmlTOCFilename + "\n" + e.toString());
						continue;
					}
					
					success = common.writeFile(writeHtmlTOCFd, new Buffer(htmlTOC));
					fs.close(writeHtmlTOCFd);
					if (!success) {
						console.log("*** Failed to write: " + htmlTOCFilename);
					} else {
						console.log("--> Wrote: " + htmlTOCFilename);
					}
				}
			} else if (COPY_EXTENSIONS.indexOf(extension) !== -1) {
				var readStream = fs.createReadStream(sourcePath);
				(function(readStream, sourcePath) {
					readStream.on("error", function(error) {
						console.log("Failed to read " + sourcePath + "\n" + error.toString());
					});
				})(readStream, sourcePath);
				
				var writeStream = fs.createWriteStream(destinationPath);
				(function(writeStream, sourcePath, destinationPath) {
					writeStream.on("error", function(error) {
						console.log("Failed to write: " + destinationPath + "\n" + error.toString());
					});
					writeStream.on("close", function() {
						console.log("-->Copied: " + sourcePath);
					});
				})(writeStream, sourcePath, destinationPath);
				
				readStream.pipe(writeStream);
			} else {
				console.log("--> Skipped: " + sourcePath);
			}
		}
	}
}

console.log("");
traverse_tree(sourceDir, destinationDir);
done();

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

/*
 * On Windows, wkHtmlToPdf can interfere with other concurrent file operations, including file operations running
 * in other instances of itself.  To mitigate this, queue all .pdf generation requests initially, and process them
 * at a defined interval after all other generation has completed.
 */

function generatePDF(htmlPath) {
	pdfQueue.push(htmlPath);
}

function done() {
	var fn = function() {
		if (!pdfQueue.length) {
			return;
		}

		var htmlPath = pdfQueue.splice(0, 1)[0];
		var pdfPath = htmlPath.replace(EXTENSION_HTML_REGEX, EXTENSION_PDF);
		pdfGenerator.generate(htmlPath, pdfPath, overwrite, pdfSettings);
		setTimeout(fn, TIMEOUT_PDF);
	};

	if (pdfQueue.length) {
		var child_process = require('child_process');
		child_process.execFile("wkhtmltopdf", ["-V"], function(err, stdout, stderr) {
			if (err) {
				console.log("*** Could not locate wkhtmltopdf, so PDFs are not being generated.  The path to its binary is likely not included in your native PATH environment variable.  Error: " + err.toString());	
			} else {
				setTimeout(fn, TIMEOUT_PDF);
			}
		});
	}
}

function outputHelpPage() {
	console.log("\n\nUsage:\n\tnode mdProcessor " + SWITCH_SOURCEDIR + "=<sourceDirectory> " + SWITCH_DESTDIR + "=<destinationDirectory> [OPTIONS]");
	console.log("\nOptions:\n");
	console.log(SWITCH_OVERWRITE);
	console.log("\tOverwrite output files that already exist");
	console.log(SWITCH_ATTRIBUTES);
	console.log("\tDisable processing of Kramdown-style attribute lists");
	console.log(SWITCH_PDF);
	console.log("\tDo not generate .pdf files");
	console.log(SWITCH_TOC);
	console.log("\tDo not generate Table of Contents files");
	console.log(SWITCH_HEADERFILE + "=<headerSourceFile>");
	console.log("\tPath to file with content to be prepended to generated .html");
	console.log(SWITCH_FOOTERFILE + "=<footerSourceFile>");
	console.log("\tPath to file with content to be appended to generated .html");
	console.log(SWITCH_PDFSETTINGSFILE + "=<pdfSettingsFile>");
	console.log("\tPath to file with PDF generation settings");
	console.log(SWITCH_CONREFFILE + "=<conrefFile>");
	console.log("\tPath to file containing Jekyll-style variable definitions");
	console.log("\n\nPDF Generation\n");
	console.log("PDF file generation is attempted by default.  For it to succeed wkhtmltopdf");
	console.log("must be installed, and the path to its binary must be in the OS' PATH");
	console.log("environment variable.  For wkhtmltopdf info and available downloads see");
	console.log("<http://wkhtmltopdf.org/>.  Note that on Windows the wkhtmltopdf")
	console.log("arch (32-/64-bit) should match that of the node.js being used.");
	console.log("\nIf " + SWITCH_PDFSETTINGSFILE + " is not specified then all default settings");
	console.log("are used.  Custom settings are specified in strict JSON format as the");
	console.log("camel-based equivalents of the settings described at");
	console.log("<http://wkhtmltopdf.org/usage/wkhtmltopdf.txt>.  For an example see the")
	console.log("included \"examplePDFsettings\" file.");
	console.log("\n\nContact:\n\nTo report bugs or request features visit");
	console.log("<https://hub.jazz.net/project/ggayed/markdownProcessor/overview>.\n");
}
