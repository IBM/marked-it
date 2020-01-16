---
title: Getting started
weight: 1
---

marked-it is a [marked](https://github.com/chjj/marked)-backed Markdown to HTML generator. This parser supports extended attribute and front matter syntaxes, and provides hooks for modifying the generated HTML.

## Installation

Add `marked-it-core` to the `dependencies` section in your node.js module's package.json file.  For example:

```js
dependencies: {
	"marked-it-core": "^0.14.0"
}
```


marked-it uses [semantic versioning](http://semver.org/).

## Example Usage

```js
var markedIt = require("marked-it-core");
var mdSource = "#Welcome to marked-it\n{: #welcomeId .title}\n";
var options = {};
var result = markedIt.generate(mdSource, options);
console.log(result.html.text);

/* Resulting output:
	<h1 id="welcomeId" class="title">Welcome to marked-it</h1>
*/
```
