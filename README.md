# marked-it

## A [marked](https://github.com/chjj/marked "marked Git repo")-backed Markdown parser that adds support for Kramdown attributes syntax, and generation of Dita map TOC files.

For info on Kramdown attributes syntax see [Attribute List Definitions](http://kramdown.gettalong.org/syntax.html#attribute-list-definitions "Attribute List Definitions") and [Inline Attribute Lists](http://kramdown.gettalong.org/syntax.html#inline-attribute-lists "Inline Attribute Lists").

## Install

``` bash
npm install marked-it
```

## Example Usage

```js
var markedIt = require("marked-it");
var result = markedIt.generate("#Welcome to marked-it\n{: .title #welcomeId}\n", {filename: "example.html"});

console.log("HTML:\n" + result.html.text);
/* Output:
	<h1 id="welcomeId" class="title">Welcome to marked-it</h1>
*/

console.log("markdown TOC:\n" + result.mdToc.text);
/* Output:
	# [Welcome to marked-it](example.html#welcomeId 'Welcome to marked-it')
*/

console.log("HTML TOC:\n" + result.htmlToc.text);
/* Output:
	<h1 id="-welcome-to-marked-it-example-html-welcomeid-welcome-to-marked-it-">
	<a href="example.html#welcomeId" title="Welcome to marked-it">Welcome to marked-it</a>
	</h1>
*/

console.log("Dita map:\n" + result.ditamap.text);
/* Output:
	<map>
	<topicref href="example.html#welcomeId" navtitle="Welcome to marked-it">
	<topicmeta><linktext>Welcome to marked-it</linktext></topicmeta>
	</topicref>
	</map>
*/
```

## marked-it.generate(mardownText [,options])

### options (default values shown)
```js
{
	processAttributes: true,
	generateToc: true,
	generateDitamap: true,
	filename: "" /* used for TOC file and Dita map generation */
}
```

### returns:
```js
{
	html: {
		text: <string>,
		errors: <array>
	},
	mdToc: { /* assuming options.generateToc !== false */
		text: <string>,
		errors: <array>
	},
	htmlToc: { /* assuming options.generateToc !== false */
		text: <string>,
		errors: <array>
	},
	ditamap: { /* assuming options.generateDitamap !== false */
		text: <string>,
		errors: <array>
	}
}
```
