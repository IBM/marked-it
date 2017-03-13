/**
 * marked-it
 *
 * Copyright (c) 2014, 2017 IBM Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
