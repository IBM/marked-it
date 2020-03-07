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
var marked = require("marked");

var attributeDefinitionLists = {};
var inlineAttributeLists = [];
var tokensStack = [];
var tocBuilders;
var processAttributes;
var processFootnotes;
var extensions;

var blockAttributeRegex = /(^|(?:\r\n|\r|\n))(([^\S\r\n]*)(\{:(?:\\\}|[^\}])*\})[^\S\r\n]*(?:\r\n|\r|\n))/g;
var footnoteDefRegex = /^<p>(\[\^([^\]\s]+)]:\s*)/;
var footnoteRefRegex = /\[\^([^\]\s]+)]/;

var spanAttributeRegex = /\{:((?:\\\}|[^\}])*)\}/;
var headerIALRegex = /[^\S\r\n]+\{:((?:\\\}|[^\}])*)\}[^\S\r\n]*$/;
var listItemIALRegex = /^(<p>)?(?:[^\S\r\n]*)\{:((?:\\\}|[^\}])*)\}/;

var _NEWLINE = "\n";
var _TAG_FOOTNOTE = "footnote";
var _TAG_FOOTNOTE_REF = "footnote-ref";

var kindOfRegex = /elementKind=(['"])([^\1]+?)\1/; /* remove when elementKind support is dropped */

var markedOptions;

var originalMarkedTok = marked.Parser.prototype.tok;

var options;
function generate(text, toc_builders, data) {
	options = data;
	attributeDefinitionLists = {};
	inlineAttributeLists = [];
	tokensStack = [];
	tocBuilders = toc_builders;
	processAttributes = data.processAttributes;
	processFootnotes = data.processFootnotes;
	extensions = data.extensions;
	markedOptions = data.markedOptions;

	var result = {html: {}};

	if (data.fixInvalidHeaders) {
		text = text.replace(/((?:^|[\r\n])#{1,6})[^#\s][^\r\n]*/g, function(string, capture1) {
			result.html.errors = result.html.errors || [];
			result.html.errors.push("Auto-fixed invalid header syntax: " + string.substring(1));
			return string.substring(0, capture1.length) + " " + string.substring(capture1.length);
		});
	}

	/* hook our custom renderer and create the parser instance */
	markedOptions.renderer = customRenderer;
	var parser = new marked.Parser(markedOptions);
	var markedTok = originalMarkedTok.bind(parser);
	marked.Parser.prototype.tok = function() {
		if (this.token.type !== "space") {
			tokensStack.push(this.token);
		}
		return markedTok();
	};

	if (processAttributes) {
		var attributeLists = [];
		var match = blockAttributeRegex.exec(text);
		while (match) {
			var index = match.index + match[1].length + match[3].length;
			var lineStart = match.index + match[1].length;
			var lineEnd = match.index + match[0].length;
			if (!kindOfRegex.test(match[4])) { /* remove this check when elementKind support is dropped */
				attributeLists.push({index: index, lineStart: lineStart, match: match});
				text = text.substring(0, lineStart) + text.substring(lineEnd);
				blockAttributeRegex.lastIndex = match.index;
			} else {
				blockAttributeRegex.lastIndex += match[0].length;
			}
			match = blockAttributeRegex.exec(text);
		}

		var refNameRegex = /\{[ ]{0,3}:((?:[\w\d])(?:[\w\d-])*):([^}]*)/;
		var attributeListContentRegex = /\{[ ]{0,3}:([^}]*)/;
		attributeLists.forEach(function(current) {
			var refNameMatch = refNameRegex.exec(current.match[4]);
			if (refNameMatch) {
				attributeDefinitionLists[refNameMatch[1]] = refNameMatch[2];
			} else {
				var content = attributeListContentRegex.exec(current.match[4]);
				inlineAttributeLists.push({index: current.index, lineStart: current.lineStart, content: content[1].trim(), match: current.match});
			}
		});
	}

	var length = text.length;
	var bounds = {start: 0, contentStart: 0, contentEnd: length, end: length};
	var rootBlock = new Block(bounds, null, null, null, null, null, null, text.substring(bounds.contentStart, bounds.end));
	
	inlineAttributeLists.forEach(function(current) {
		index = current.index;

		var checkNextLine = true;
		if (current.lineStart) {
			/* not on the first line */
			var previousLineEnd = current.lineStart - 1;
			if (previousLineEnd > 0 && text.charAt(previousLineEnd - 1) === _CR) {
				previousLineEnd--;
			}
			var previousLineStart = getLineStart(text, previousLineEnd); /* backtrack to start of previous line */
			var previousLine = text.substring(previousLineStart, current.lineStart - 1);
			if (!previousLine.indexOf(current.match[3]) && /\S+/.test(previousLine.substring(current.match[3].length))) {
				/* the previous line is not "blank" (excluding indentation characters), move the index back into the previous line's block */
				checkNextLine = false;
				index = previousLineStart + current.match[3].length;
			}
		}
		if (checkNextLine) {
			/* the "next" line is actually now the current line since all IAL lines have been removed from text */
			var nextLineStart = current.lineStart;
			var nextLineEnd = getLineEnd(text, nextLineStart);
			var nextLine = text.substring(nextLineStart, nextLineEnd - 1);
			if (nextLine.indexOf(current.match[3]) || !/\S+/.test(nextLine.substring(current.match[3].length))) {
				/* the "next" line is "blank" (excluding indentation characters), so this IAL should not be applied anywhere */
				index = -1;
			}
		}

		if (index !== -1) {
			var adjacentBlock = findAdjacentBlock(rootBlock, text, index);
			if (adjacentBlock) {
				adjacentBlock.inlineAttributes = adjacentBlock.inlineAttributes || [];
				adjacentBlock.inlineAttributes.push(current.content);
			}
		}
	});

	var blocks = rootBlock.getBlocks();
	var html = "";
	blocks.forEach(function(current) {
		var tokens = [];
		accumulateTokens(current, tokens);
		tokens.links = rootBlock.links;
		html += parser.parse(tokens);
	});

	/*
	 * marked's regexs detect one-word footnote definitions as being link definitions, and as a
	 * result removes them from the source such that <p>s never get generated for them.  Get these
	 * removed footnote definition details from `blocks.links` and provide them as additional footnote
	 * definitions when computing footnotes.
	 */
	var additionalFootnoteDefs = {};
	var keys = Object.keys(blocks.links || {});
	keys.forEach(function(key) {
		if (key.startsWith('^')) {
			additionalFootnoteDefs[key.substring(1)] = blocks.links[key].href;
		}
	});
	html = generateFootnotes(html, additionalFootnoteDefs);

	result.html.text = html;
	return result;
}

function accumulateTokens(block, _result) {
	/*
	 * A block has either a set of its own content tokens, or a start/
	 * endToken pair and therefore likely child blocks and tokens.
	 */
	if (block.tokens) {
		block.tokens[0].inlineAttributes = block.inlineAttributes;
		Array.prototype.push.apply(_result, block.tokens);
		return;
	}

	if (!block.startToken || !block.endToken) {
		return; /* should not happen */
	}

	block.startToken.inlineAttributes = block.inlineAttributes;
	_result.push(block.startToken);
	var subBlocks = block.getBlocks();
	subBlocks.forEach(function(current) {
		accumulateTokens(current, _result);
	});
	_result.push(block.endToken);
}

function binarySearch(array, offset, inclusive, low, high) {
	var index;
	if (low === undefined) { low = -1; }
	if (high === undefined) { high = array.length; }
	while (high - low > 1) {
		index = Math.floor((high + low) / 2);
		if (offset <= array[index].start) {
			high = index;
		} else if (inclusive && offset < array[index].end) {
			high = index;
			break;
		} else {
			low = index;
		}
	}
	return high;
}

function findAdjacentBlock(parentBlock, text, index) {
	var blocks = parentBlock.getBlocks();
	for (var i = 0; i < blocks.length; i++) {
		if (blocks[i].start <= index && index < blocks[i].end) {
			var blockStartLineStart = getLineStart(text, blocks[i].start);
			var indexLineStart = getLineStart(text, index);
			if (blocks[i].start - blockStartLineStart === index - indexLineStart && text.substring(blockStartLineStart, blocks[i].start) === text.substring(indexLineStart, index)) {			
//			if (blocks[i].start === index) {
				return blocks[i];
			}
			return findAdjacentBlock(blocks[i], text, index);
		}
	}
	return null;
}

function findBlock(parentBlock, offset) {
	var blocks = parentBlock.getBlocks();
	if (!blocks.length) {
		return parentBlock;
	}

	var index = binarySearch(blocks, offset, true);
	if (index < blocks.length && blocks[index].start <= offset && offset <= blocks[index].end - 1) {
		return findBlock(blocks[index], offset);
	}
	return parentBlock;
}

function invokeExtensions(name, value, additionalData) {
	var data = {
		htmlToDom: common.htmlToDom,
		domToHtml: common.domToHtml,
		domToInnerHtml: common.domToInnerHtml,
		domUtils: common.domUtils,
		escape: common.escape,
		unescape: common.unescape
	};
	for (var propName in additionalData || {}) {
		data[propName] = additionalData[propName];
	}
	return common.invokeExtensions(extensions, name, value, data);
}

/* definition of custom renderer to use when marked parser gets created */

var customRenderer = new marked.Renderer();
customRenderer.heading = function(text, level, raw) {
	var textMatch = headerIALRegex.exec(text);
	if (textMatch) {
		text = text.substring(0, textMatch.index).trim();
		var rawMatch = headerIALRegex.exec(raw);
		raw = raw.substring(0, rawMatch.index).trim();
	}

	/* remove all in-line span attributes from raw so that they don't affect the auto-generated element id */
	raw = raw.replace(new RegExp(spanAttributeRegex.source, "g"), "");

	/* remove footnote references from raw so that they don't affect the auto-generated element id */
	raw = raw.replace(new RegExp(footnoteRefRegex.source, "g"), "");

	var result = marked.Renderer.prototype.heading.call(this, text, level, raw);
	var dom = common.htmlToDom(result)[0];
	applySpanAttributes(dom);
	invokeSpanExtensions(dom);
	result = common.domToHtml(dom);
	var token = tokensStack.pop();
	if (rawMatch) {
		token.inlineAttributes = token.inlineAttributes || [];
		token.inlineAttributes.push(rawMatch[1].trim());
	}

	result = applyToken(result, token);
	if (tocBuilders) {
		/* ensure that all attribute lists have been applied before using the header's id */
		dom = common.htmlToDom(result)[0];
		var title = common.domUtils.getText(dom);
		/* remove footnote references from title so that they don't show up in generated TOCs */
		title = title.replace(new RegExp(footnoteRefRegex.source, "g"), "");
		tocBuilders.forEach(function(current) {
			current.heading(title, level, result);
		});
	}

	result = invokeExtensions("html.onHeading", result + _NEWLINE, {src: token.src});
	result = processFootnoteRefs(result);
	return result;
};
customRenderer.code = function(code, lang, escaped) {
	var result = marked.Renderer.prototype.code.call(this, code, lang, escaped);
	var dom = common.htmlToDom(result)[0];
	applySpanAttributes(dom);
	result = common.domToHtml(dom);
	var token = tokensStack.pop();
	result = applyToken(result, token);
	return invokeExtensions("html.onCode", result, {src: token.src});
};
customRenderer.blockquote = function(quote) {
	/*
	 * Since blockquote is a container element, use it as an opportunity to define arbitrary kinds of
	 * container elements by looking for the "elementKind" attribute.  This is very hacky and should
	 * be dropped.
	 */
	var result;
	var attributesRegex = /<p>{:(.+)}<\/p>/;
	var match = attributesRegex.exec(quote);
	if (processAttributes && match) {
		/* found attributes */
		quote = quote.replace(match[0], "").trim();
		var attributes = common.unescape(match[1]);
		var elementName = "blockquote";
		match = kindOfRegex.exec(attributes);
		if (match) {
			/* found an elementKind attribute, which is handled specially */
			elementName = match[2];
			attributes = attributes.replace(match[0], "").trim();
		}
		result = "<" + elementName + " " + attributes + ">\n" + quote + "\n</" + elementName + ">\n";
	} else {
		/* no attributes to handle, so just return the default renderer's text */
		result = marked.Renderer.prototype.blockquote.call(this, quote);		
	}

	var token = tokensStack.pop();
	result = applyToken(result, token);
	return invokeExtensions("html.onBlockquote", result);
};
customRenderer.html = function(html) {
	var result = marked.Renderer.prototype.html.call(this, html);
	var token = tokensStack.pop();
	result = applyToken(result, token);
	return invokeExtensions("html.onHtml", result, {src: token.src});
};
customRenderer.hr = function() {
	var result = marked.Renderer.prototype.hr.call(this);
	var token = tokensStack.pop();
	result = applyToken(result, token);
	return invokeExtensions("html.onHr", result, {src: token.src});
};
customRenderer.link = function(href, title, text) {
	/*
	 * Special case: marked's regexs detect one-word footnote definitions as being link definitions.
	 * Detect this case here and override to generate a footnote reference rather than a link reference.
	 */
	if (text.startsWith("^")) {
		return processFootnoteRefs('[' + text + ']');
	}

	/* typical case, just stay out of the way */
	return marked.Renderer.prototype.link.call(this, href, title, text);
};
customRenderer.list = function(body, ordered, start) {
	var result = marked.Renderer.prototype.list.call(this, body, ordered, start);
	var token = tokensStack.pop();
	result = applyToken(result, token);
	return invokeExtensions("html.onList", result);
};
customRenderer.listitem = function(text) {
	var inlineAttributes = []
	var match = listItemIALRegex.exec(text);
	while (match) {
		inlineAttributes.push(match[2].trim());
		text = (match[1] ? text.substring(0, match[1].length) : "") + text.substring(match[0].length).trim();
		match = listItemIALRegex.exec(text);
	}
	var result = marked.Renderer.prototype.listitem.call(this, text);
	var dom = common.htmlToDom(result)[0];
	applySpanAttributes(dom);
	invokeSpanExtensions(dom);
	result = common.domToHtml(dom);
	var token = tokensStack.pop();
	if (inlineAttributes.length) {
		token.inlineAttributes = (token.inlineAttributes || []).concat(inlineAttributes);
	}
	result = applyToken(result, token) + _NEWLINE;
	return invokeExtensions("html.onListItem", result);
};
customRenderer.paragraph = function(text) {
	var result = marked.Renderer.prototype.paragraph.call(this, text);
	var dom = common.htmlToDom(result)[0];
	applySpanAttributes(dom);
	invokeSpanExtensions(dom);
	result = common.domToHtml(dom);
	var token = tokensStack.pop();
	result = applyToken(result, token) + _NEWLINE;
	result = invokeExtensions("html.onParagraph", result, {src: token.src});
	result = processFootnoteDef(result);
	result = processFootnoteRefs(result);
	return result;
};
customRenderer.table = function(header, body) {
	var result = marked.Renderer.prototype.table.call(this, header, body);
	var dom = common.htmlToDom(result)[0];
	applySpanAttributes(dom);
	invokeSpanExtensions(dom);
	result = common.domToHtml(dom);
	var token = tokensStack.pop();
	result = applyToken(result, token) + _NEWLINE;
	return invokeExtensions("html.onTable", result, {src: token.src});
};
customRenderer.tablerow = function(content) {
	var result = marked.Renderer.prototype.tablerow.call(this, content);
//	return applyToken(result, tokensStack.pop());
	return invokeExtensions("html.onTablerow", result);
};
customRenderer.tablecell = function(content, flags) {
	var result = marked.Renderer.prototype.tablecell.call(this, content, flags);
//	return applyToken(result, tokensStack.pop());
	result = invokeExtensions("html.onTablecell", result);
	result = processFootnoteRefs(result);
	return result;
};

function invokeSpanExtensions(node) {
	var name = (node.name || "").toLowerCase();
	var id;
	switch (name) {
		case "img": {
			id = "html.onImage";
			break;
		}
		case "strong": {
			id = "html.onStrong";
			break;
		}
		case "em": {
			id = "html.onEmphasis";
			break;
		}
		case "code": {
			id = "html.onCodespan";
			break;
		}
		case "del": {
			id = "html.onDel";
			break;
		}
		case "a": {
			id = "html.onLink";
			break;
		}

	}
	if (id) {
		var original = common.domToHtml(node);
		var replacement = invokeExtensions(id, original);
		if (replacement !== original) {
			var newNode = common.htmlToDom(replacement)[0];
			common.domUtils.replaceElement(node, newNode);
			node = newNode;
		}
	}
	var children = common.domUtils.getChildren(node) || [];
	children.forEach(function(current) {
		invokeSpanExtensions(current);
	});
}

function applySpanAttributes(node) {
	var childNodes = common.domUtils.getChildren(node) || [];
	for (var i = 0; i < childNodes.length; i++) {
		var child = childNodes[i];
		if (child.type === "text") {
			var childText = common.domUtils.getText(child);
			var match = spanAttributeRegex.exec(childText);
			if (match && !match.index) {
				var previousSibling = child.prev;
				if (previousSibling) {
					child.data = childText.substring(match[0].length);
					var attributes = computeAttributes([common.unescape(match[1].trim())]);
					var keys = Object.keys(attributes);
					keys.forEach(function(current) {
						previousSibling.attribs[current] = attributes[current];
					});
					i--; /* decrement so that the current child will be tried again */
				}
			}
		}
		applySpanAttributes(child);
	}
}

function applyToken(htmlString, token) {
	if (!htmlString) {
		return htmlString;
	}
	
	var endsWithNL = /(\r\n|\r|\n)$/.exec(htmlString);
	if (endsWithNL) {
		endsWithNL = endsWithNL[1];
	} else if (token.type === "code") {
		endsWithNL = "\n";
	}

	var root = common.htmlToDom(htmlString)[0];
	if (!root.attribs) {
		/*
		 * This is the case for source strings that don't generate tags,
		 * such as HTML comment blocks. Just return the original html string.
		 */
		return htmlString;
	}

	if (token.inlineAttributes) {
		var attributes = computeAttributes(token.inlineAttributes);
		var keys = Object.keys(attributes);
		keys.forEach(function(current) {
			root.attribs[current] = attributes[current];
		});
	}
	return common.domToHtml(root) + (endsWithNL || "");
}

function computeAttributes(inlineAttributes) {
	var keys;
	var result = {};
	var idRegex = /^#([\S]+)/;
	var classRegex = /^\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/;
	var attributeRegex = /^([^\/>"'=]+)=(['"])([^\2]+)\2/;
	var segmentRegex = /([^ \t'"]|((['"])(.(?!\3))*.\3))+/g;

	var inheritedAttributes = {}; /* from ADLs */
	var localAttributes = {}; /* from IALs */

	inlineAttributes.forEach(function(current) {
		var segmentMatch = segmentRegex.exec(current);
		while (segmentMatch) {
			segmentMatch = segmentMatch[0].trim();
			if (segmentMatch.length) {
				var match = idRegex.exec(segmentMatch);
				if (match) {
					localAttributes.id = match[1];
				} else {
					match = classRegex.exec(segmentMatch);
					if (match) {
						var classes = localAttributes["class"] || "";
						classes += (classes ? " " : "") + match[1];
						localAttributes["class"] = classes;
					} else {
						match = attributeRegex.exec(segmentMatch);
						if (match) {
							localAttributes[match[1]] = match[3];
						} else {
							if (attributeDefinitionLists[segmentMatch]) {
								var attributes = computeAttributes([attributeDefinitionLists[segmentMatch]]);
								keys = Object.keys(attributes);
								keys.forEach(function(key) {
									if (key === "class" && inheritedAttributes[key]) {
										/* merge conflicting class values rather than overwriting */
										inheritedAttributes[key] += " " + attributes[key];
									} else {
										inheritedAttributes[key] = attributes[key];
									}
								});
							} else {
								/* an attribute without a value */
								localAttributes[segmentMatch] = null;
							}
						}
					}
				}
			}
			segmentMatch = segmentRegex.exec(current);
		}
	});

	/* add inherited attributes first so that locally-defined attributes will overwrite inherited ones when a name conflict occurs */

	keys = Object.keys(inheritedAttributes);
	keys.forEach(function(key) {
		result[key] = inheritedAttributes[key];
	});

	keys = Object.keys(localAttributes);
	keys.forEach(function(key) {
		if (key === "class") {
			/* merge conflicting class values rather than overwriting */
			result[key] = (result[key] || "") + (result[key] ? " " : "")  + localAttributes[key];
		} else {
			result[key] = localAttributes[key];
		}
	});

	return result;
}

function processFootnoteDef(text) {
	if (!processFootnotes) {
		return text;
	}

	var match = footnoteDefRegex.exec(text);
	if (match) {
		text = text.replace(match[1], "<" + _TAG_FOOTNOTE + " id='" + match[2] + "'></" + _TAG_FOOTNOTE + ">");
	}
	return text;
}

function processFootnoteRefs(text) {
	if (!processFootnotes) {
		return text;
	}

	var match = footnoteRefRegex.exec(text);
	while (match) {
		text = text.replace(match[0], "<" + _TAG_FOOTNOTE_REF + " id='" + match[1] + "'></" + _TAG_FOOTNOTE_REF + ">");
		match = footnoteRefRegex.exec(text);
	}
	return text;
}

function generateFootnotes(text, additionalFootnoteDefs) {
	var nextIndex = 1;
	var dom = common.htmlToDom(text);
	var footnotes = common.domUtils.findAll(function(node) {return node.name === _TAG_FOOTNOTE}, dom);
	var footnoteRefs = common.domUtils.findAll(function(node) {return node.name === _TAG_FOOTNOTE_REF}, dom);
	var listElement;
	footnoteRefs.forEach(function(ref) {
		var id = ref.attribs.id;
		var footnote = null;
		for (var i = 0; i < footnotes.length; i++) {
			if (footnotes[i] && footnotes[i].attribs.id === id) {
				footnote = footnotes[i];
				footnotes[i] = null; /* to track which footnotes have not been referenced exactly once */
				break;
			}
		}

		var lowercaseId = id.toLowerCase();
		if (!footnote && additionalFootnoteDefs[lowercaseId]) {
			var source = processFootnoteDef("<p>[^" + id + "]: " + additionalFootnoteDefs[lowercaseId]);
			var footnoteParent = common.htmlToDom(source)[0];
			footnote = common.domUtils.getChildren(footnoteParent)[0];
			additionalFootnoteDefs[lowercaseId] = null; /* to track which additional footnotes have not been referenced exactly once */
		}

		if (footnote) {
			var index = nextIndex++;
			var anchorId = "footnote-" + id;
			var conflict = common.domUtils.find(function(node) {return node.id === anchorId || node.id === anchorId + "-ref"}, dom);
			while (conflict.length) {
				anchorId += "a";
				conflict = common.domUtils.find(function(node) {return node.id === anchorId || node.id === anchorId + "-ref"}, dom);
			}
			common.domUtils.replaceElement(ref, common.htmlToDom("<sup><a href='#" + anchorId + "' id='" + anchorId + "-ref'>" + index + "</a></sup>")[0]);

			var parent = common.domUtils.getParent(footnote);
			footnote.type = "text";

			/* look for subsequent indented paragraphs to merge into the footnote */
			var next = parent.next;
			var nextnext;
			if (next) {
				nextnext = next.next;
			}
			if (nextnext && nextnext.name === "pre") {
				var additionalElement = common.domUtils.find(function(node) {return node.type === "text"}, [nextnext], true, 1);
				if (additionalElement.length) {
					var generatedContent = generate(additionalElement[0].data, null, options);
					if ((generatedContent.html || {}).text) {
						var index = dom.indexOf(nextnext);
						if (index > -1) {
							dom.splice(index, 1);
						}
						common.domUtils.removeElement(nextnext);
						index = dom.indexOf(next);
						if (index > -1) {
							dom.splice(index, 1);
						}
						common.domUtils.removeElement(next);
						var generatedElements = common.htmlToDom(generatedContent.html.text);
						generatedElements.forEach(function(current) {
							common.domUtils.appendChild(parent, current);
						});
					}
				}
			}

			/* append the link back to the reference */
			var linkBack = common.htmlToDom("<a id='linkBack-" + anchorId + "' href='#" + anchorId + "-ref'>&#8617;</a>")[0];
			common.domUtils.appendChild(parent, linkBack);

			if (!listElement) {
				var hr = common.htmlToDom("<hr id='footnotesSeparator'>")[0];
				dom.push(hr);
				listElement = common.htmlToDom("<ol id='footnotesList'></ol>")[0];
				dom.push(listElement);
			}

			/* move the footnote <p> into the list element */
			var index = dom.indexOf(parent);
			if (index > -1) {
				dom.splice(index, 1);
			}
			common.domUtils.removeElement(parent);
			var listItem = common.htmlToDom("<li id='" + anchorId + "'></li>")[0];
			common.domUtils.appendChild(listItem, parent);
			common.domUtils.appendChild(listElement, listItem);
		} else {
			/* no matching footnote, revert the reference to what its original text would have been */
			ref.type = "text";
			ref.data = "[^" + ref.attribs.id + "]";
		}
	});

	/* revert any unreferenced footnotes to what their original texts would have been */
	footnotes.forEach(function(footnote) {
		if (footnote) {
			footnote.type = "text";
			footnote.data = "[^" + footnote.attribs.id + "]: ";
		}
	});

	var result = common.domToHtml(dom);
	return result;
}

marked.Parser.prototype.parseText = function() {
	var body = "";
	var currentText = this.token.text;
	var match = blockAttributeRegex.exec(currentText);
	if (!match || match[0].length !== currentText.length) {
		body += currentText;
	}

	while (this.peek().type === 'text') {
		currentText = this.next().text;
		match = blockAttributeRegex.exec(currentText);
		if (!match || match[0].length !== currentText.length) {
			body += '\n' + currentText;
		}
	}

	/*
	 * The added footnote syntax is causing confusion with core regexs in marked,
	 * so detect footnote syntax here and replace it with an innocuous tag.
	 */
	var changes = [];
	if (this.token.type === "text") {
		body = processFootnoteRefs(body);
	}
	return this.inline.output(body);
};

/* the following is based on functions in Orion's MarkdownEditor.js */

var _CR = "\r";
var _TYPEID_DEF = "meta.link.reference.def.markdown";
var _TYPEID_HEADING = "markup.heading.markdown";
var _TYPEID_LISTITEM = "markup.list.item.markdown";
var _TYPEID_PARAGRAPH = "markup.other.paragraph.markdown";
var _atxDetectRegex = /[>\s]*#/g;
var _blockquoteStartRegex = /[^\S\r\n]*>[^\S\r\n]?/g;
var _fencedCodeBlockRegex = /`{3,}|~{3,}/g;
var _hrRegex = /([^\S\r\n]*[-*_]){3,}/g;
var _newlineRegex = /\r\n|\r|\n/g;
var _spacesAndTabsRegex = /[^\S\r\n]*/g;
var _whitespaceRegex = /\s+/g;

function advanceIndex(text, token, index) {
	if (token.text) {
		/*
		 * Must split the text and crawl through each of its parts because
		 * the token text may not exactly match our source text (in
		 * particular because marked converts all tabs to spaces).
		 */
		_whitespaceRegex.lastIndex = 0;
		var segments = token.text.split(_whitespaceRegex);
		segments.forEach(function(current) {
			if (current.length) {
				index = text.indexOf(current, index) + current.length;
			}
		});

		if (token.type === "code" && token.hasOwnProperty("lang")) { //$NON-NLS-1$ //$NON-NLS-0$
			/* a gfm fenced code block, need to claim more characters */
			_fencedCodeBlockRegex.lastIndex = index;
			var match = _fencedCodeBlockRegex.exec(text);
			index = match.index + match[0].length;
		}
	} else if (token.type === "blockquote_start") { //$NON-NLS-0$
		_blockquoteStartRegex.lastIndex = index;
		var match = _blockquoteStartRegex.exec(text);
		index = match.index + match[0].length;
	} else if (token.type === "hr") { //$NON-NLS-0$
		_hrRegex.lastIndex = index;
		match = _hrRegex.exec(text);
		index = match.index + match[0].length;
	} else if (token.type === "space") { //$NON-NLS-0$
		/*
		 * The following is intentionally commented, it's not needed in this context
		 * of processing a full markdown file from beginning-to-end because computeBlocks()
		 * does a whitespace eat for every token.
		 */
//		_newlineRegex.lastIndex = index;
//		match = _newlineRegex.exec(text);
//		index = match.index + match[0].length;
	} else if (token.type === "table") { //$NON-NLS-0$
		segments = token.header.slice();
		token.cells.forEach(function(current) {
			segments = segments.concat(current);
		});
		segments.forEach(function(current) {
			if (current.length) {
				index = text.indexOf(current, index) + current.length;
			}
		});
	} else if (token.type.indexOf("_item_start") !== -1) { //$NON-NLS-0$
		/* marked.Lexer.rules.normal.bullet is not global, so cannot set its lastIndex */
		text = text.substring(index);
		match = marked.Lexer.rules.normal.bullet.exec(text);
		if (match) {
			index += match.index + match[0].length;
		}
	}
	return index;
}

function computeBlocks(text, block, offset) {
	var result = [];
	var tokens;

	if (block.typeId) {
		/* parent is a block other than the root block */
		if (block.typeId !== "markup.quote.markdown" && //$NON-NLS-0$
			block.typeId !== "markup.list.markdown" && //$NON-NLS-0$
			block.typeId !== _TYPEID_LISTITEM) {
				/* no other kinds of blocks have sub-blocks, so just return */
				return result;
		}

		tokens = block.seedTokens;
		block.seedTokens = null;
	}

	var index = 0;
	tokens = tokens || marked.lexer(text, markedOptions); // TODO is this redundant with the lexer instance above?

	for (var i = 0; i < tokens.length; i++) {
		var bounds = null, typeId = null, end = null, newlines = null;
		var startToken = null, contentToken = null, endToken = null;
		var seedTokens = null;

		typeId = null;
		_whitespaceRegex.lastIndex = index;
		var whitespaceResult = _whitespaceRegex.exec(text);
		if (whitespaceResult && whitespaceResult.index === index) {
			index += whitespaceResult[0].length;
		}

		if (tokens[i].type === "heading") { //$NON-NLS-0$
			_atxDetectRegex.lastIndex = index;
			var match = _atxDetectRegex.exec(text);
			var isAtx = match && match.index === index;
			var lineEnd = getLineEnd(text, index);
			end = isAtx ? lineEnd : getLineEnd(text, index, 1);
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: lineEnd,
				end: end
			};
			typeId = _TYPEID_HEADING;
			contentToken = tokens[i];
			index = end;
		} else if (tokens[i].type === "paragraph" || tokens[i].type === "text") { //$NON-NLS-1$ //$NON-NLS-0$
			end = advanceIndex(text, tokens[i], index);
			end = getLineEnd(text, end);

			if (!isTop(block)) {
				tokens[i].type = "text"; //$NON-NLS-0$
			}
			contentToken = tokens[i];

			bounds = {
				start: index,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			typeId = tokens[i].isHTML ? "markup.raw.html.markdown" : _TYPEID_PARAGRAPH; //$NON-NLS-0$
			index = end;
		} else if (tokens[i].type === "def") { //$NON-NLS-0$
			var newlineCount = 0;
			if (tokens[i].title) {
				var titleIndex = text.indexOf(tokens[i].title, index + 1);
				var substring = text.substring(index, titleIndex);
				match = substring.match(_newlineRegex);
				if (match) {
					newlineCount = match.length;
				}
			}
			end = getLineEnd(text, index, newlineCount);

			contentToken = tokens[i];
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			typeId = _TYPEID_DEF;
			index = end;
		} else if (tokens[i].type === "blockquote_start" || tokens[i].type === "list_start") { //$NON-NLS-1$ //$NON-NLS-0$
			/*
			 * Use text contained in the tokens between the *_start and *_end
			 * tokens to crawl through the text to determine the block's end bound.
			 */

			if (tokens[i].type === "blockquote_start") { //$NON-NLS-0$
				endToken = "blockquote_end"; //$NON-NLS-0$
				typeId = "markup.quote.markdown"; //$NON-NLS-0$
			} else { /* list_start */
				endToken = "list_end"; //$NON-NLS-0$
				typeId = "markup.list.markdown"; //$NON-NLS-0$
			}

			var start = index;
			/*
			 * Note that *_start tokens can stack (eg.- a list within a list)
			 * so must be sure to find the _matching_ end token.
			 */
			var j = i;
			var stack = 0;
			while (true) {
				if (tokens[j].type === tokens[i].type) {
					stack++; /* a start token */
				} else if (tokens[j].type === endToken) {
					if (!--stack) {
						break;
					}
				}
				index = advanceIndex(text, tokens[j], index);
				j++;
			}

			/* claim the newline character that ends this element if there is one */
			_newlineRegex.lastIndex = index;
			match = _newlineRegex.exec(text);
			if (match) {
				index = match.index + match[0].length;
				if (typeId === "markup.list.markdown") { //$NON-NLS-0$
					/* for lists claim whitespace that starts the next line */
					_spacesAndTabsRegex.lastIndex = index;
					match = _spacesAndTabsRegex.exec(text);
					if (match && match.index === index) {
						index += match[0].length;
					}
				}
			}

			/* compute the block's contentStart bound */
			if (typeId === "markup.quote.markdown") { //$NON-NLS-0$
				_blockquoteStartRegex.lastIndex = start;
				match = _blockquoteStartRegex.exec(text);
				var contentStart = start + match[0].length;
			} else {
				/* marked.Lexer.rules.normal.bullet is not global, so cannot set its lastIndex */
				var tempText = text.substring(start);
				match = marked.Lexer.rules.normal.bullet.exec(tempText);
				start += match.index;
				contentStart = start;
			}
			index = Math.max(index, contentStart);
			bounds = {
				start: start,
				contentStart: contentStart,
				contentEnd: index,
				end: index
			};

			startToken = tokens[i];
			endToken = tokens[j];
			seedTokens = tokens.slice(i + 1, j);
			i = j;
		} else if (tokens[i].type.indexOf("_item_start") !== -1) { //$NON-NLS-0$
			/*
			 * Use text contained in the tokens between the list_item_start and list_item_end
			 * tokens to crawl through the text to determine the list item's end bound.
			 */
			start = index;

			/*
			 * Note that *_item_start tokens can stack (eg.- a list item within a list within a list
			 * item) so must be sure to find the _matching_ end token.
			 */
			j = i;
			stack = 0;
			while (true) {
				if (tokens[j].type === "list_item_start" || tokens[j].type === "loose_item_start") { //$NON-NLS-1$ //$NON-NLS-0$
					stack++; /* a start token */
				} else if (tokens[j].type === "list_item_end") { //$NON-NLS-0$
					if (!--stack) {
						break;
					}
				}
				index = advanceIndex(text, tokens[j], index);
				j++;
			}

			/* claim the newline character that ends this item if there is one */
			_newlineRegex.lastIndex = index;
			match = _newlineRegex.exec(text);
			if (match) {
				index = match.index + match[0].length;
			}

			/* compute the block's contentStart bound */

			/* marked.Lexer.rules.normal.bullet is not global, so cannot set its lastIndex */
			tempText = text.substring(start);
			match = marked.Lexer.rules.normal.bullet.exec(tempText);
			contentStart = start + match.index + match[0].length;
			index = Math.max(index, contentStart);
			bounds = {
				start: start,
				contentStart: contentStart,
				contentEnd: index,
				end: index
			};

			typeId = _TYPEID_LISTITEM;
			startToken = tokens[i];
			endToken = tokens[j];
			seedTokens = tokens.slice(i + 1, j);
			i = j;
		} else if (tokens[i].type === "code") { //$NON-NLS-0$
			/*
			 * gfm fenced code blocks can be differentiated from markdown code blocks by the
			 * presence of a "lang" property.
			 */
			if (tokens[i].hasOwnProperty("lang")) { //$NON-NLS-0$
				_fencedCodeBlockRegex.lastIndex = index;
				match = _fencedCodeBlockRegex.exec(text);
				start = match.index;
				_fencedCodeBlockRegex.lastIndex = start + match[0].length;
				match = _fencedCodeBlockRegex.exec(text);
				end = match.index + match[0].length;
				typeId = "markup.raw.code.fenced.gfm"; //$NON-NLS-0$
			} else {
				start = getLineStart(text, index); /* backtrack to start of line */
				newlines = tokens[i].text.match(_newlineRegex);
				end = getLineEnd(text, index, newlines ? newlines.length : 0);
				typeId = "markup.raw.code.markdown"; //$NON-NLS-0$
			}

			_whitespaceRegex.lastIndex = end;
			match = _whitespaceRegex.exec(text);
			if (match && match.index === end) {
				end += match[0].length;
			}

			bounds = {
				start: start,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			contentToken = tokens[i];
			index = end;
		} else if (tokens[i].type === "hr") { //$NON-NLS-0$
			end = getLineEnd(text, index);
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			typeId = "markup.other.separator.markdown"; //$NON-NLS-0$
			contentToken = tokens[i];
			index = end;
		} else if (tokens[i].type === "table") { //$NON-NLS-0$
			end = getLineEnd(text, index, tokens[i].cells.length + 1);
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			if (isTop(block)) {
				typeId = "markup.other.table.gfm"; //$NON-NLS-0$
				contentToken = tokens[i];
			} else {
				/*
				 * This can happen if the table's text is scanned by marked without the surrounding
				 * context of its parent block (eg.- marked does not realize that the table text is
				 * in a list item).  Create a text token with the table's text to be used by the parent
				 * block.
				 */
				typeId = _TYPEID_PARAGRAPH;
				contentToken = {type: "text", text: text.substring(index, end)}; //$NON-NLS-0$
			}
			index = end;
		} else if (tokens[i].type === "space") { //$NON-NLS-0$
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: index,
				end: index
			};
			typeId = _TYPEID_PARAGRAPH;
			contentToken = tokens[i];
		} else if (tokens[i].type === "html") { //$NON-NLS-0$
			end = advanceIndex(text, tokens[i], index);
			end = getLineEnd(text, end);
			bounds = {
				start: index,
				contentStart: index,
				contentEnd: end,
				end: end
			};
			typeId = "markup.raw.html.markdown"; //$NON-NLS-0$
			contentToken = tokens[i];
			index = end;
		}

		if (typeId) {
			bounds.start = bounds.start + offset;
			bounds.contentStart = bounds.contentStart + offset;
			bounds.contentEnd = bounds.contentEnd + offset;
			bounds.end = bounds.end + offset;
			var newBlock = new Block(bounds, typeId, block, startToken, endToken, contentToken ? [contentToken] : null, seedTokens, text.substring(bounds.contentStart - offset, bounds.end - offset));
			result.push(newBlock);
		}
	}

	result.links = tokens.links;
	return result;
}

function getLineEnd(text, index, lineSkip) {
	lineSkip = lineSkip || 0;
	while (true) {
		_newlineRegex.lastIndex = index;
		var result = _newlineRegex.exec(text);
		if (!result) {
			return text.length;
		}
		index = result.index + result[0].length;
		if (!lineSkip--) {
			return index;
		}
	}
}

function getLineStart(text, index) {
	while (0 <= --index) {
		var char = text.charAt(index);
		if (char === _NEWLINE || char === _CR) {
			return index + 1;
		}
	}
	return 0;
}

function isTop(block) {
	if (!block.typeId) {
		return true;
	}
	/* marked treats blockquote contents as top-level */
	if (block.typeId === "markup.quote.markdown") { //$NON-NLS-0$
		return isTop(block.parent);
	}
	return false;
}

function Block(bounds, typeId, parent, startToken, endToken, tokens, seedTokens, text) {
	this.start = bounds.start;
	this.end = bounds.end;
	this.contentStart = bounds.contentStart;
	this.contentEnd = bounds.contentEnd;
	this.typeId = typeId;
	this.parent = parent;
	this.startToken = startToken;
	this.endToken = endToken;
	this.tokens = tokens;
	this.seedTokens = seedTokens;
	this._subBlocks = computeBlocks(text, this, this.contentStart);
	this.links = this._subBlocks.links;
	if (tokens) {
		tokens.forEach(function(current) {
			current.src = text;
		});
	}
}

Block.prototype = {
	getBlocks: function() {
		return this._subBlocks;
	}
};

module.exports.generate = generate;
