---
title: What are extensions?
weight: 2
---

Extensions are functions that can hook into well-defined points in the HTML generation process.  A client can provide an array of extensions to the `marked-it.generate()` *options* object.

All extension functions receive two arguments:
- *value*: the default value that has been generated
- *data*: additional data and functions that may be helpful for generating a replacement value

If the extension function returns any string, including "", then that string will replace the initially-generated *value* in the end document.  If a non-string value is returned then the initially-generated *value* is preserved.

For an example of an extension that adds *<caption>* elements to generated *<table>* elements see [/examples/extension-tableCaptions.js](https://ibm.github.io/marked-it/examples/extension-tableCaptions.js).

## HTML Generation extensions

All extensions in this section receive a *data* object containing:

`htmlToDom(string, options)`
> A function that returns the HTML string for a DOM object.  See [options](https://github.com/fb55/htmlparser2/).

`domToHtml(dom, options)`
> A function that returns a DOM representation of an HTML string.
>
> *options*:  
>> *xmlMode*: <boolean>  
>> *decodeEntities*: <boolean>

`domToInnerHtml(string, options)`
> A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

`domUtils`
> An object with functions for manipulating DOM objects.  The functions are defined in the various files [here](https://github.com/fb55/domutils/).

## TOC Generation extensions

**Note:** The TOC generation is being re-thought and therefore this extension is subject to change.

This extension receives a *data* object containing:

`header`
> The source header string that this TOC entry would point to.

`htmlToDom(string, options)`
> A function that returns the HTML string for a DOM object.  See [options](https://github.com/fb55/htmlparser2/).

`domToHtml(dom, options)`
> A function that returns a DOM representation of an HTML string.
>
> *options*:  
>> *xmlMode*: <boolean>  
>> *decodeEntities*: <boolean>

`domToInnerHtml(string, options)`
> A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

`domUtils`
> An object with functions for manipulating DOM objects.  The functions are defined in the various files found [here](https://github.com/fb55/domutils/).

### TOC Generation extension points

	json.toc.onTopic
	xml.toc.onTopic
