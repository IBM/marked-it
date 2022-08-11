# Extensions used in marked-it

Extensions are functions that can hook into well-defined points in the HTML generation process.  A client can provide an array of extensions to the `marked-it.generate()` *options* object.

All extension functions receive two arguments:
- *value*  the default value that has been generated
- *data*  additional data and functions that may be helpful for generating a replacement value

If the extension function returns any string, including "", then that string will replace the initially-generated *value* in the end document. If a non-string value is returned then the initially-generated *value* is preserved.

For an example of an extension that adds `<caption>` elements to generated `<table>` elements see [/examples/extension-tableCaptions.js](https://github.com/IBM/marked-it/blob/master/examples/extension-tableCaptions.js).

## HTML generation extensions

All extensions in this section receive a *data* object containing:

`htmlToDom(string, options)`  A function that returns the HTML string for a DOM object.  See [options](https://github.com/fb55/htmlparser2/blob/f1aec5979f471d2dab416035b0dbcb1cace17ad5/src/Parser.ts#L102).

`domToHtml(dom, options)`  A function that returns a DOM representation of an HTML string.
  > **Options**  
  > * *xmlMode*: `<boolean>`  
  > * *decodeEntities*: `<boolean>`

`domToInnerHtml(string, options)`  A function to convert a DOM object to its inner HTML string.  It takes the same *options* as the `domToHtml` function.

`domUtils`  An object with functions for manipulating DOM objects.  The functions are defined in the various files [here](https://github.com/fb55/domutils/tree/master/src).

## Extension list

The following extensions are used in marked-it:

| Extension | Example code | Usage |
|---------|-------------------|-------------------------------------------------------|
| Audio | [audioExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/audioExt.js) | [Audio](audio) |
| Content references | Functional extension. The replacement of variables with their resolved values happens in [marked-it.js](https://github.com/IBM/marked-it/blob/467cc9d270a78a57855f66ca127b7e937a545a08/lib/marked-it.js#L170) | [Conrefs](conrefs) |
| Figures | _Custom IBM Cloud extension to meet accessibility needs_ | _IBM only_ |
| Glossary tooltips | _Custom IBM Cloud extension to provide glossary definitions as tooltips inline_ | _IBM only_ |
| Header and footer | [headerFooterExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/headerFooterExt.js) | Creates the [header and footer](headers) portions of the HTML output. |
| Includes | [includes](https://github.com/IBM/marked-it-cli/blob/master/example/includesExt.js) | Authoring reuse of files or sections of topics accross doc sets with [Includes](includes) |
| Key references | Functional extension. The replacement of variables with their resolved values happens in [marked-it.js](https://github.com/IBM/marked-it/blob/467cc9d270a78a57855f66ca127b7e937a545a08/lib/marked-it.js#L170) | [Keyrefs](keyrefs) |
| Sections | [generateSectionsExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/generateSectionsExt.js) |  Wraps all headings and the content within in a `<section>` element in the HTML output. |
| Syntax highlighting | Functional extension. Defined in marked-it-cli [mdProcessor.js](https://github.com/IBM/marked-it-cli/blob/e944afb49abf4cab3c9e70f0c13e0d3b43896e72/lib/mdProcessor.js#L75) | [Syntax highlighting](syntax-highlighting) |
| Tables | _Custom IBM Cloud extension to meet accessibility and design needs_ | _IBM only_ |
| Table of contents | JSON format [jsonTocExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/jsonTocExt.js) and XML format [xmlTocExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/xmlTocExt.js) | [Table of contents](toc) |
| Terraform | _Custom IBM Cloud extension to add syntax highlighting in Terraform examples_ | _IBM only_ |
| Videos | [videoExt.js](https://github.com/IBM/marked-it-cli/blob/master/example/videoExt.js) | [Videos](video) |
