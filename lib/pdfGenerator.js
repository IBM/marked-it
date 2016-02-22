/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var common = require("./common");
var fs = require("fs");
var htmlparser = require("htmlparser2");
var path = require("path");
var wkHtmlToPdf = require("wkhtmltopdf");

function generate(htmlPath, pdfPath, overwrite, settings) {
	try {
		var outputStream = fs.createWriteStream(pdfPath, {flags: overwrite ? "w" : "wx"});
	} catch (e) {
		console.log("*** Failed to open file to write: " + pdfPath + "\n" + e.toString());
		return;
	};

	/*
	 * On Windows, wkHtmlToPdf fails to locate resources like images whose paths are relative.
	 * To work around this, load the source .html and set its base directory to the current
	 * directory, and generate the .pdf from this modified .html content.
	 */
	
	if (/^win/.test(process.platform)) {
		try {
			var readFd = fs.openSync(htmlPath, "r");
		} catch (e) {
			console.log("*** Failed to open file to read: " + htmlPath + "\n" + e.toString());
			outputStream.end();
			return;
		}
		
		var htmlString = common.readFile(readFd);
		fs.close(readFd);
		
		var dom = common.htmlToDom(htmlString);
		var domUtils = htmlparser.DomUtils;
		var headElement = domUtils.find(function(node) {return node.name && node.name.toLowerCase() === "head";}, [dom], true, 1);
		if (headElement.length) {
			headElement = headElement[0];
		} else {
			headElement = {type: "tag", name: "head", children: [], attribs: {}};
			var bodyElement = domUtils.find(function(node) {return node.name && node.name.toLowerCase() === "body";}, [dom], true, 1);
			if (!bodyElement.length) {
				console.log("*** Failed to generate .pdf, could not locate a <body> tag in: " + htmlPath);
				outputStream.end();
				return;
			}
			domUtils.prepend(bodyElement[0], headElement);
		}
		var baseElement = {type: "tag", name: "base", children: [], attribs: {}};
		baseElement.attribs.href = "file:///" + path.dirname(htmlPath) + path.sep;
		domUtils.appendChild(headElement, baseElement);
		var updatedHtmlString = common.domToHtml(dom);

		try {
			wkHtmlToPdf(updatedHtmlString, settings).pipe(outputStream);
			console.log("--> Wrote: " + pdfPath);
		} catch (e) {
			console.log("*** Failed to generate .pdf output for " + htmlPath + ": " + e);
			outputStream.end();
		}
	} else {
		/* non-Windows platform, just generate the .pdf from the original .html file */
		try {
			wkHtmlToPdf("file:///" + htmlPath, settings).pipe(outputStream);
			console.log("--> Wrote: " + pdfPath);
		} catch (e) {
			console.log("*** Failed to generate .pdf output for " + htmlPath + ": " + e);
			outputStream.end();
		}
	}
}

module.exports.generate = generate;
