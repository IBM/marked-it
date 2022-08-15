
<!-- a code block with an unknown language -->
```zsdgfdzfghz
const OPTIONS_MARKDOWNIT = {
	html: true,
	linkify: true,
	highlight: function(str, lang) {
		if (lang && highlightJs.getLanguage(lang)) {
			try {
				return highlightJs.highlight(str, { language: lang }).value;
			} catch (e) {
				return null;
			}
		}
		return '';
	}
};
```
{: #syntaxStylingUnknown a="b" .anotherClass}

<!-- a JS code block -->
```js
const OPTIONS_MARKDOWNIT = {
	html: true,
	linkify: true,
	highlight: function(str, lang) {
		if (lang && highlightJs.getLanguage(lang)) {
			try {
				return highlightJs.highlight(str, { language: lang }).value;
			} catch (e) {
				return null;
			}
		}
		return '';
	}
};
```
{: #syntaxStylingJS}

# Header H1

<-- technically invalid but allowed -->
# Another H1 Header

<-- the deepest header level -->
###### H6

<-- one level beyond the deepest header level -->
####### H7

<-- repeat of a header -->

## A Repeat Header

## A Repeat Header

<!-- repeat of a header id -->

## An H2 Header
{: #some-header}

## Some Header

## A header with many attributes
{: #alternateHeaderId}
{: .anotherHeaderClass g="'h'" i='""j""'}
{: c="d"}{: e="f"}{: a='b' .aHeaderClass}


<!-- used by the subsequent footnote test -->
[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they
belong to the previous footnote.


<!-- code block with attributes -->
```js
const OPTIONS_MARKDOWNIT = {
	html: true,
	linkify: true,
	highlight: function(str, lang) {
		if (lang && highlightJs.getLanguage(lang)) {
			try {
				return highlightJs.highlight(str, { language: lang }).value;
			} catch (e) {
				return null;
			}
		}
		return '';
	}
};
```
{: #codeBlockWithAttributes a="b"}

<!-- footnote tests -->
Here is a footnote reference[^9], and another[^longnote].
{: #footnote}

Here is a footnote that's [^missing].
{: #footnoteMissing}

<!-- used by the footnote test -->
[^9]: Here is the footnote.


<!-- definition lists -->

Term 1

:   Definition 1

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.


Final Element that intentionally ends with an attribute and no terminating whitespace
{: lastElement}