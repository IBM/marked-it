# marked-it

A [marked](https://github.com/chjj/marked)-backed Markdown->HTML generator.  Supports extended attribute and front matter syntaxes, and provides hooks for modifying the generated HTML.

## Install

``` bash
npm install marked-it-core
```

## Example Usage

```js
var markedIt = require("marked-it-core");
var result = markedIt.generate("#Welcome to marked-it\n{: #welcomeId .title}\n");
console.log(result.html.text);

/* Output:
	<h1 id="welcomeId" class="title">Welcome to marked-it</h1>
*/

```

## API

### marked-it.generate(markdownText [,*options*])

#### *options* (default values shown)
```js
{
	extensions: {},
	markedOptions: {tables: true, gfm: true, headerPrefix: "", xhtml: true, langPrefix: "lang-"},
	processAttributes: true,
	processFrontMatter: true,
	variablesMap: {},
	
	/* the following TOC generation options are subject to change */
	tocJSON: false,
	tocDepth: Infinity
	filePath: ""
}
```

#### *returns:*
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

Extensions are functions that can hook into well-defined points in the HTML generation process.  A client can provide an array of extensions to the `marked-it.generate()` *options* object.

All extension functions receive two arguments:
- *value*: the default value that has been generated
- *data*: additional data and functions that may be helpful for generating a replacement value

If the extension function returns any string, including "", then that string will replace the initially-generated *value* in the end document.  If a non-string value is returned then the initially-generated *value* is preserved.

For an example of an extension that adds *<caption>* elements to generated *<table>* elements see [./examples/extension-tableCaptions.js](./examples/extension-tableCaptions.js).

### HTML Generation extensions

All extensions in this section receive a *data* object containing:

`htmlToDom(string, options)`
> A function that returns the HTML string for a DOM object.  See [options](https://github.com/fb55/htmlparser2/blob/master/lib/Parser.js).

`domToHtml(dom, options)`
> A function that returns a DOM representation of an HTML string.
>
> *options*:  
>> *xmlMode*: <boolean>  
>> *decodeEntities*: <boolean>

`domToInnerHtml(string, options)`
> A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

`domUtils`
> An object with functions for manipulating DOM objects.  The functions are defined in the various files [here](https://github.com/fb55/domutils/tree/master/lib).

#### HTML Generation extension points

> *html.onHeading*  
> *html.onCode*  
> *html.onBlockquote*  
> *html.onHtml*  
> *html.onHr*  
> *html.onList*  
> *html.onListItem*  
> *html.onParagraph*  
> *html.onTable*  
> *html.onTablerow*  
> *html.onTablecell*  
> *html.onStrong*  
> *html.onEmphasis*  
> *html.onCodespan*  
> *html.onDel*  
> *html.onLink*  
> *html.onImage*  

### TOC Generation extensions

*(Note that TOC generation is being re-thought and therefore this extension is subject to change)*

This extension receives a *data* object containing:

`header`
> The source header string that this TOC entry would point to.

`htmlToDom(string, options)`
> A function that returns the HTML string for a DOM object.  See [options](https://github.com/fb55/htmlparser2/blob/master/lib/Parser.js).

`domToHtml(dom, options)`
> A function that returns a DOM representation of an HTML string.
>
> *options*:  
>> *xmlMode*: <boolean>  
>> *decodeEntities*: <boolean>

`domToInnerHtml(string, options)`
> A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

`domUtils`
> An object with functions for manipulating DOM objects.  The functions are defined in the various files found [here](https://github.com/fb55/domutils/tree/master/lib).

#### TOC Generation extension points

	json.toc.onTopic
	xml.toc.onTopic
