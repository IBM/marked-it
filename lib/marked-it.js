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

var htmlGenerator = require("./htmlGenerator");
var jsYaml = require("js-yaml");
var tocJSONadapter = require("./tocJSONadapter");
var tocJSONgenerator = require("./tocJSONgenerator");
var tocXMLadapter = require("./tocXMLadapter");
var tocXMLgenerator = require("./tocXMLgenerator");

var extensions;

var DELIMITER_FRONTMATTER = /(?:^|\n)---\r?\n/g;

var DEFAULT_OPTIONS = {tables: true, gfm: true, headerPrefix: "", xhtml: true, langPrefix: "lang-"};

function generate(source, options) {
	if (typeof source !== "string") {
		return {html: {errors: ["source is not a string"]}};
	}

	options = options || {};
	if (options.processAttributes !== false) {
		options.processAttributes = true;
	}
	if (options.processFootnotes !== false) {
		options.processFootnotes = true;
	}
	if (options.processFrontMatter !== false) {
		options.processFrontMatter = true;
	}
	extensions = options.extensions;
	
	var markedOptions = options.markedOptions || DEFAULT_OPTIONS;

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
	var adapter = new tocXMLadapter(extensions);
	var xmlGenerator = new tocXMLgenerator(adapter, options.filePath, options.tocDepth || Infinity, true);
	tocGenerators.push(xmlGenerator);

	adapter = new tocJSONadapter(extensions);
	var jsonGenerator = new tocJSONgenerator(adapter, options.filePath, options.tocDepth || Infinity);
	tocGenerators.push(jsonGenerator);

	var htmlResult = htmlGenerator.generate(
		source,
		tocGenerators,
		{
			processAttributes: options.processAttributes,
			processFootnotes: options.processFootnotes,
			extensions: extensions,
			markedOptions: markedOptions,
			fixInvalidHeaders: options.fixInvalidHeaders
		}
	);
	result.html.text = htmlResult.html.text;
	if (htmlResult.html.errors) {
		result.html.errors = result.html.errors || [];
		result.html.errors.push.apply(result.html.errors, htmlResult.html.errors);
	}

	result.properties = {document: {}};
	var title = tocGenerators[0].getTitle();
	if (title) {
		result.properties.document.title = title;
	}
	if (frontMatterMap) {
		result.properties.document.frontMatterMap = frontMatterMap;
	}

	if (xmlGenerator) {
		result.xmlToc = {text: xmlGenerator.buffer()};
		errors = xmlGenerator.getErrors();
		if (errors) {
			result.xmlToc.errors = errors; 
		}
	}
	if (jsonGenerator) {
		result.jsonToc = {text: jsonGenerator.buffer()};
		errors = jsonGenerator.getErrors();
		if (errors) {
			result.jsonToc.errors = errors; 
		}
	}

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
		var result = jsYaml.safeLoad(frontMatter);
		if (typeof result === "string") {
			/* in some cases jsYaml returns the invalid source string rather than throwing an error */
			return {error: "Invalid YAML syntax"};
		}
		return {
			map: result,
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
module.exports.tocJSONadapter = tocJSONadapter;
module.exports.tocXMLadapter = tocXMLadapter;
