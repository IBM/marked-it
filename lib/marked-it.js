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
var htmlGenerator = require("./htmlGenerator");
var tocGenerator = require("./tocGenerator");

function generate(source, options) {
	if (typeof source !== "string") {
		return {html: {errors: ["source is not a string"]}};
	}

	options = options || {};
	if (options.processAttributes !== false) {
		options.processAttributes = true;
	}

	var tocGenerators = [];
	var xmlTocGenerator, ditaTocGenerator, htmlTocGenerator;
	if (options.tocXML) {
		xmlTocGenerator = new tocGenerator({
			createRoot: function() {
				return common.htmlToDom("<toc></toc>\n");
			},
			createTopic: function(href, label, level, properties) {
				var topic = common.htmlToDom("<topic href='" + href + "' label='" + label + "'>\n</topic>\n");
				properties.forEach(function(current) {
					var property = common.htmlToDom("<property name='" + current.name + "' value='" + current.value + "'>\n</property>\n");
					common.domUtils.appendChild(topic, property);					
				});
				return topic;
			}
		}, options.filePath, options.tocDepth || Infinity, true);
		tocGenerators.push(xmlTocGenerator);
	}
	if (options.tocDITA) {
		ditaTocGenerator = new tocGenerator({
			createRoot: function() {
				return common.htmlToDom("<map></map>\n");
			},
			createTopic: function(href, label, level, properties) {
				var topic = common.htmlToDom("<topicref href='" + href + "' navtitle='" + label + "'>\n</topicref>\n");
				var meta = common.htmlToDom("<topicmeta><linktext>" + label + "</linktext></topicmeta>");
				common.domUtils.appendChild(topic, meta);
				properties.forEach(function(current) {
					var property = common.htmlToDom("<property name='" + current.name + "' value='" + current.value + "'>\n</property>\n");
					common.domUtils.appendChild(topic, property);					
				});
				return topic;
			}
		}, options.filePath, options.tocDepth || Infinity, true);
		tocGenerators.push(ditaTocGenerator);
	}

	/*
	 * If no toc generators have been added yet then add one now, to validate the
	 * document's headers structure and to capture the page title info if present.
	 */
	if (!tocGenerators.length || options.tocHTML) {
		htmlTocGenerator = new tocGenerator({
			createRoot: function() {
				return common.htmlToDom("<html></html>\n");
			},
			createTopic: function(href, label, level, properties) {
				var topicString = "<div><h" + level + "><a href='" + href + "'";
				properties.forEach(function(current) {
					topicString += " " + current.name + "='" + current.value + "'";
				});
				topicString += ">";
				topicString += label + "</a></h" + level + "></div>\n";
				return common.htmlToDom(topicString);
			}
		}, options.filePath, options.tocDepth || Infinity, false);
		tocGenerators.push(htmlTocGenerator);
	}

	var htmlResult = htmlGenerator.generate(source, options.processAttributes, tocGenerators);
	var result = {
		html: {text: htmlResult},
		properties: {
			document: {title: tocGenerators[0].getTitle()}
		}
	}

	if (xmlTocGenerator) {
		result.xmlToc = {text: xmlTocGenerator.buffer()};
		errors = xmlTocGenerator.getErrors();
		if (errors) {
			result.xmlToc.errors = errors; 
		}
	}
	if (ditaTocGenerator) {
		result.ditaToc = {text: ditaTocGenerator.buffer()};
		errors = ditaTocGenerator.getErrors();
		if (errors) {
			result.ditaToc.errors = errors; 
		}
	}
	if (htmlTocGenerator) {
		result.htmlToc = {text: htmlTocGenerator.buffer()};
		errors = htmlTocGenerator.getErrors();
		if (errors) {
			result.htmlToc.errors = errors; 
		}
	}
	return result;
}

module.exports.generate = generate;
