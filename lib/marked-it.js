/*******************************************************************************
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var ditamapGenerator = require("./ditamapGenerator");
var htmlGenerator = require("./htmlGenerator");
var tocGenerator = require("./tocGenerator");

function generate(source, options) {
	if (typeof source !== "string") {
		return {html: {error: "source is not a string"}};
	}

	options = options || {};
	tocGenerator.reset(options.filename || "");
	var htmlResult = htmlGenerator.generate(source, options.processAttributes || true, tocGenerator);
	var result = {
		html: {text: htmlResult}
	};
	if (options.generateToc !== false) {
		result.mdToc = {text: tocGenerator.buffer()};
		result.htmlToc = {text: htmlGenerator.generate(result.mdToc.text, options.processAttributes || true)};
	}
	if (options.generateDitamap !== false) {
		ditamapGenerator.reset();
		htmlGenerator.generate(tocGenerator.buffer(), options.processAttributes || true, ditamapGenerator);
		result.ditamap = {text: ditamapGenerator.buffer()};
		var errors = ditamapGenerator.getErrors();
		if (errors) {
			result.ditamap.errors = errors; 
		}
	}
	return result;
}

module.exports.generate = generate;
