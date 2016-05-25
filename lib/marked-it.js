/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var htmlGenerator = require("./htmlGenerator");
var tocGenerator = require("./tocGenerator");

function generate(source, options) {
	if (typeof source !== "string") {
		return {html: {errors: ["source is not a string"]}};
	}
	options = options || {};

	/*
	 * The default tocGenerator is used even if TOC generation is disabled
	 * because it is also used to get the page title if there is one.
	 */
	tocGenerator.reset(options.filePath || "");
	var tocGenerators = [tocGenerator];
	if (options.generateDitamap !== false) {
		var ditamapGenerator = require("./ditamapGenerator");
		ditamapGenerator.reset(options.filePath || "");
		tocGenerators.push(ditamapGenerator);
	}
	if (options.generateToc !== false) {
		var xmlTocGenerator = require("./xmlTocGenerator");
		xmlTocGenerator.reset(options.filePath || "");
		tocGenerators.push(xmlTocGenerator);
	}

	var htmlResult = htmlGenerator.generate(source, options.processAttributes || true, tocGenerators);
	var result = {
		html: {text: htmlResult},
		properties: {
			document: {title: tocGenerator.getTitle()}
		}
	}

	if (options.generateDitamap !== false) {
		result.ditamap = {text: ditamapGenerator.buffer()};
		var errors = ditamapGenerator.getErrors();
		if (errors) {
			result.ditamap.errors = errors; 
		}
	}
	if (options.generateToc !== false) {
		result.mdToc = {text: tocGenerator.buffer()};
		result.htmlToc = {text: htmlGenerator.generate(result.mdToc.text, options.processAttributes || true)};
		result.xmlToc = {text: xmlTocGenerator.buffer()};
		errors = xmlTocGenerator.getErrors();
		if (errors) {
			result.xmlToc.errors = errors; 
		}
	}
	return result;
}

module.exports.generate = generate;
