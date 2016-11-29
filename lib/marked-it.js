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
var jsYaml = require("js-yaml");
var tocGenerator = require("./tocGenerator");

var extensions;

var DELIMITER_FRONTMATTER = /(?:^|\n)---\r?\n/g;

function generate(source, options) {
	if (typeof source !== "string") {
		return {html: {errors: ["source is not a string"]}};
	}

	options = options || {};
	if (options.processAttributes !== false) {
		options.processAttributes = true;
	}
	if (options.processFrontMatter !== false) {
		options.processFrontMatter = true;
	}
	extensions = options.extensions;

	var result = {
		html: {} 
	};

	var frontMatterMap;
	if (options.processFrontMatter) {
		var frontMatterResult = extractFrontMatter(source);
		if (frontMatterResult) {
			/* YAML front matter was present */
			if (frontMatterResult.error) {
				result.html.errors = ["Failed to parse front matter: " + frontMatterResult.error.toString()];
			} else {
				source = frontMatterResult.text;
				frontMatterMap = frontMatterResult.map;
			}
		}
	}
	source = replaceVariables(source, [frontMatterMap, options.variablesMap]);

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

	var htmlResult = htmlGenerator.generate(
		source,
		tocGenerators,
		{
			processAttributes: options.processAttributes,
			extensions: extensions
		}
	);

	result.properties = {document: {}};
	var title = tocGenerators[0].getTitle();
	if (title) {
		result.properties.document.title = title;
	}
	if (frontMatterMap) {
		result.properties.document.frontMatterMap = frontMatterMap;
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

	result.html.text = common.invokeExtensions(
		extensions,
		"html.onComplete",
		htmlResult,
		{
			title: title,
			frontMatterMap: frontMatterMap,
			variablesMap: options.variablesMap,
			replaceVariables: replaceVariables,
			source: source
		});

	return result;
}

function extractFrontMatter(text) {
    DELIMITER_FRONTMATTER.lastIndex = 0;
    var startMatch = DELIMITER_FRONTMATTER.exec(text);
    if (!(startMatch && startMatch.index === 0)) {
        return null; /* no valid start delimiter */
    }

    var endMatch = DELIMITER_FRONTMATTER.exec(text);
    if (!endMatch) {
        return null; /* no end delimiter */
    }

    var frontMatter = text.substring(startMatch[0].length, endMatch.index);
    try {
	    return {
	        map: jsYaml.safeLoad(frontMatter),
	        text: text.substring(endMatch.index + endMatch[0].length)
	    }
	} catch (e) {
		return {error: e}
	}
}

function replaceVariables(text, variableMaps) {
	if (!variableMaps || typeof(text) !== "string") {
		return text;
	}
	if (!(variableMaps instanceof Array)) {
		variableMaps = [variableMaps];
	}

	var VAR_OPEN = "{{";
	var VAR_CLOSE = "}}";
	
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

		/*
		 * Iterate through the maps in reverse order so that if a key is defined in more
		 * than one then the definition from the map with highest precedence wins.
		 */
		for (var i = variableMaps.length - 1; i >= 0; i--) {
			if (variableMaps[i]) {
				var temp = key.split(".").reduce(
					function get(result, currentKey) {
						if (result) { /* result may be null if content is not valid yaml */
							return result[currentKey];
						}
					},
					variableMaps[i]);
				if (temp) {
					value = temp;
				}
			}
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

module.exports.generate = generate;
