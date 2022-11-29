---

front:
  matter: Front Matter

---

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

## Heading with a footnote[^longnote]

<!-- used by the footnote test -->
[^9]: Here is the footnote.


<!-- definition lists -->

Term 1

:   Definition 1

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.


<!-- linkification -->

This project lives at https://www.github.com
{: #plaintextLink}

This project lives at www.github.com
{: #fuzzyLink}

Contacting the White House. Please send your comments to comments@whitehouse.gov. Due to the large volume of e-mail received, the White House cannot respond to every message.
{: #fuzzyEmail}

<!-- subscript -->

H~2~O

<!-- superscript -->

19^th^

<!-- tables -->

| Header1\nok | Header2\nok | 
|-----|-----|
| Bold\nok | Elements:  \n - `<strong>`  \n - `<b>` *(deprecated)* |
| **Code**\nok | Elements:  \n - `<code>`  \n - `<pre>` |
{: #tableWithCellFormatting .testTable}

<table>
<thead>
  <tr>
    <th id="no-newline">*no\nnewline*</th>
    <th id="no-list">**no \n - list**</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td id="no-em">*no em*</td>
    <td id="no-strong">**no strong**</td>
  </tr>
  <tr>
    <td id="em"><em>em</em></td>
    <td id="strong"><strong>strong</strong></td>
  </tr>
</table>
{: #tableHTML}

| <em>Preamble</em>Header1\nok | Header2\nok | 
|-----|-----|
| **Bold** <em>Postamble</em> | **Bold** |
| Elements:  \n - one  \n - two <strong>Postamble</strong> | Elements:  \n - one  \n - two |
{: #tableWithTags}

| Header  | Header  | Header  |  Header |
|-------- |-------- |-------- |-------- |
| Content | Content | Content | my |
| Content | Content | Content | |
{: #tableWithLastCellEmpty .testTable}


This sentence has a {{root-level}} variable, a {{root-level-path}} variable, a {{hierarchical.label.string}} variable, a {{front.matter}} variable and a {{missing}} one.
{: #variables}

<-- the deepest header level -->
###### H6

Final Element that intentionally ends with an attribute and no terminating whitespace
{: #lastElement}
