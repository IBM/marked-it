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
	options = options || {};
	tocGenerator.reset(options.filename || "");
	var htmlResult = htmlGenerator.generate(source, options.processAttributes || true, tocGenerator);
	var result = {
		html: htmlResult
	};
	if (options.generateToc !== false) {
		result.mdToc = tocGenerator.buffer();
		result.htmlToc = htmlGenerator.generate(result.mdToc, options.processAttributes || true);
	}
	if (options.generateDitamap !== false) {
		ditamapGenerator.reset();
		htmlGenerator.generate(tocGenerator.buffer(), options.processAttributes || true, ditamapGenerator);
		result.ditamap = ditamapGenerator.buffer();
	}
	return result;
}

module.exports.generate = generate;
