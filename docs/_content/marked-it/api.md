---
title: API reference
weight: 6
---

The marked-it Markdown generator lets you go from Markdown source to HTML5 output.

## generate()
The generate method generates HTML content from source Markdown text.

`generate(markdownText [,options])`


Arguments:
- *markdownText*
> The markdown source string from which to generate HTML.
- *options*
> An optional configuration object with any of the following values:
> - *extensions*: An object containing extension functions (see [Extensions](#extensions)).
> - *markedOptions*: An object with configuration options to pass to the underlying [marked](https://github.com/chjj/marked) HTML generator ([list of valid options](https://marked.js.org/#/USING_ADVANCED.md#options)).  Defaults to: `{tables: true, gfm: true, headerPrefix: "", xhtml: true, langPrefix: "lang-"}`
> - *processAttributes*: Boolean, indicates whether Kramdown-style attributes in the Markdown source should be processed as attributes rather than as plain text. Defaults to `true`.
> - *processFootnotes*: Boolean, indicates whether [footnotes](https://www.markdownguide.org/extended-syntax/#footnotes) in the Markdown source should be processed as footnotes rather than as plain text. Defaults to `true`.
> - *processFrontMatter*: Boolean, indicates whether Jekyll-style front matter in the Markdown source should be processed as front matter rather than as plain text. Defaults to `true`.
> - *variablesMap*: An object with name->value mappings to apply when variables are encountered in the Markdown source.
> - tocDepth: A number indicating the deepest header depth that should be included in generated Table of Contents results.  Defaults to `6`.
> - filePath: A path string to prepend to generated Table of Contents entries.  Defaults to `""`.


#### Return Value

```js
{
	html: {
		text: <string>,
		errors: <array>
	},
	properties: {
		document: {
			title: <string>,
			frontMatterMap: <object>
		}
	},
	jsonToc: {
		text: <string>,
		errors: <array>
	},
	xmlToc: {
		text: <string>,
		errors: <array>
	}
}
```

## Extensions

marked-it provides hooks ("extension points") into its process that allow clients to customize the generated content.  Clients utilize these hooks by passing an *options.extensions* argument to the `generate` call with functions ("extensions") to be invoked.

marked-it's extension points have hierarchical identifiers, for example: `html.onHeading`.  To provide an extension for this extension point, a client would create an extensions argument like:

```js
	{
		html: {
			onHeading: <function or array of functions>
		}
	}
```

When invoked, extension functions receive two arguments:
1. The default value that marked-it has computed.
2. A data object containing various data and functions that may be useful for computing an alternate value.

If an extension returns `undefined`, `null`, or a value type that differs from the default value, then the default value is retained.  Otherwise, the value returned by the extension is adopted in place of the default value.

### HTML Generation Extension Points

Most of marked-it's extension points enable clients to override the HTML that is generated for Markdown elements.  These extension functions receive two arguments:
1. The default generated HTML content.
2. A data object containing element-specific details and common DOM manipulation functions.  The common DOM manipulation functions are:

> `htmlToDom(string, options)`
>> A function that returns the DOM representation of an HTML string.  See [options](https://github.com/fb55/htmlparser2/blob/v3.8.3/lib/Parser.js).

> `domToHtml(dom, options)`
>> A function that returns the HTML string for a DOM object.
>>
>> *options*:  
>>> *xmlMode*: `<boolean>`  
>>> *decodeEntities*: `<boolean>`

>`domToInnerHtml(string, options)`
>> A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

>`domUtils`
>> An object with functions for manipulating DOM objects.  The functions are [defined in the various files](https://github.com/fb55/domutils/tree/master/lib).

The supported extension points are:

| id | Type of Element | Additional arg 2 fields |
| -- | ----------- | ---------------------------- |
| `html.onHeading` | headers | `src` |
| `html.onCode` | code blocks | `src` |
| `html.onBlockquote` | blockquotes | |
| `html.onHtml` | passed-through HTML | `src` |
| `html.onHr` | for overriding header elements | `src` |
| `html.onList` | lists | |
| `html.onListItem` | list items | |
| `html.onParagraph` | paragraphs | `src` |
| `html.onTable` | tables | `src` |
| `html.onTablerow` | table rows | |
| `html.onTablecell` | table cells | |
| `html.onStrong` | strong content | |
| `html.onEmphasis` | emphasized content | |
| `html.onCodespan` | in-line code spans | |
| `html.onLinebreak` | linebreaks | |
| `html.onDel` | strikethrough content | |
| `html.onLink` | links | |
| `html.onImage` | images | |

### TOC Generation Extension Points

marked-it's TOC generation extension points may be re-designed in a future major revision, so if you use these be sure that your `marked-it-core` dependency specifies major revision `0`.  These extension functions receive two arguments:
1. The default generated TOC content.
2. A data object containing field:

> `header`
>> The source header string.

The supported extension points are:

| id | TOC type | Additional arg 2 fields |
| -- | ----------- | ---------------------------- |
| `json.toc.onTopic` | JSON |  |
| `xml.toc.onTopic` | XML | Functions: `htmlToDom`, `domToHtml`, `domToInnerHtml`, `domUtils` |
