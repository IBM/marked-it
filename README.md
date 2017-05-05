# marked-it

A Marked-backed Markdown->HTML generator.  Supports extended attribute and front matter syntaxes, and provides hooks for modifying the generated HTML.

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

```

## marked-it.generate(markdownText [,options])

### options (default values shown)
```js
{
	processAttributes: true,
	generateToc: true,
	filename: "" /* used for TOC file generation */
}
```

### returns:
```js
{
	html: {
		text: <string>,
		errors: <array>
	}
}
```
