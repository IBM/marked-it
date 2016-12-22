/*******************************************************************************
 * Copyright (c) 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

var common = require("./common");

var tocXMLadapter = function(extensions) {
	this.extensions = extensions || [];
}

tocXMLadapter.prototype = {
	createRoot: function() {
		return "<toc></toc>\n";
	},
	createTopic: function(href, label, level, heading) {
		return common.invokeExtensions(
			this.extensions,
			"xml.toc.onTopic",
			"<topic href='" + href + "' label='" + label + "'>\n</topic>\n",
			{
				heading: heading || {},
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domUtils: common.domUtils
			});
	}
}
		
module.exports = tocXMLadapter;
