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

var tocHTMLadapter = function(extensions) {
	this.extensions = extensions || [];
}

tocHTMLadapter.prototype = {
	createRoot: function() {
		return "<html></html>\n";
	},
	createTopic: function(href, label, level, heading) {
		level = level || 2; // TODO hack to enable generation of TOC external links
		return common.invokeExtensions(
			this.extensions,
			"html.toc.onTopic",
			"<div><h" + level + "><a href='" + href + "'>" + label + "</a></h" + level + "></div>\n",
			{
				heading: heading || {},
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domUtils: common.domUtils
			});
	}
}
		
module.exports = tocHTMLadapter;
