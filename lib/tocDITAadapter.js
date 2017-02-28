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

var tocDITAadapter = function(extensions) {
	this.extensions = extensions || [];
}

tocDITAadapter.prototype = {
	createRoot: function() {
		return "<map></map>\n";
	},
	createTopic: function(href, label, level, heading) {
		var topic = common.htmlToDom("<topicref href='" + href + "' navtitle='" + label + "'>\n</topicref>\n")[0];
		var meta = common.htmlToDom("<topicmeta><linktext>" + label + "</linktext></topicmeta>")[0];
		common.domUtils.appendChild(topic, meta);
		return common.invokeExtensions(
			this.extensions,
			"html.toc.onTopic",
			common.domToHtml(topic),
			{
				heading: heading || {},
				htmlToDom: common.htmlToDom,
				domToHtml: common.domToHtml,
				domToInnerHtml: common.domToInnerHtml,
				domUtils: common.domUtils
			});
	}
}
	
module.exports = tocDITAadapter;
