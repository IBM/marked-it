# Markup mapping - Lightweight DITA, Markdown, HTML 5

The following table provides mappings between Lightweight DITA, Markdown, and HTML5.

|     Element     |   XDITA   | Markdown  |   HTML5      |
|-----------------|-----------|-----------|--------------|
| **container**    | `<topic>` | No equivalent; added during transform        | `<article>`   |
| **title**       | `<title>` | `# ## ### ####`          | `<h1>...<h6> `|
| **short description** |`<shortdesc>` | No equivalent, but first  paragraph of text under the title with a `{.shortdesc}` attributef|`<p class="shortdesc">`|
| **body**|`<body>`|`No equivalent` added during  transform |`<body>`|
| **section** | `<section>` | No equivalent; added for headings during transform with the `generateSectionsExt.js` extension | `<section id="section-headingID”>` |
| **image**  | `<image>`	|	`![alt text](image.jpg)` | `<img>` |
| **figure**  | `<image>`	|	`![alt text](image.jpg){: caption="Figure 1. Figure caption text" caption-side="bottom"}` | `<fig><img><figcaption>` |
| **video** | `<video>` | `![Video title](https://www.youtube.com/embed/<video-ID>){: video output="iframe" data-script="none" id="youtubeplayer" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen}` | `<video>` |	
| **audio** | `<audio>` | `![Audio sample title](https://example.com/audio-sample.wav){: audio controls}` | `<audio>` |	
| **footnote**  | `<fn>`	|	`[^1]: This is the first footnote.`  |	`<span data-class=“fn”>	<hr id="footnotesSeparator"><ol id="footnotesList"><li id="footnote-ID”>` |
| **note** | `<note>` 	|	`{: note}` attribute following a paragraph	|	`<p class="note">This is a note paragraph.</p>`|
| **unordered list** | `<ul>` | `*` or `-`| `<ul><li></li></ul>` |
| **ordered list** | `<ol>` | `1.`  <br>  `2.`  <br> `3.` | `<ol><li></li></ol>`|
| **list item** | `<li>` | Use the appropriate list type; nested lists are supported:  <br> `* unordered list item` or `- unordered list item`  <br> `1. ordered list item` | `<li>` |
| **definition list** | `<dl>` | Orange  <br> `:   The fruit of an evergreen tree of the genus Citrus.` | `<dl>` |
| **term** | `<dt>` | Orange | `<dt>` |
| **definition** | `<dd>` | `:   The fruit of an evergreen tree of the genus Citrus.` | `<dd>` |
| **paragraph** | `<p>` | Paragraphs in Markdown are just one or more lines of consecutive text followed by one or more blank lines. | `<p>` |
| **phrase** | `<ph>`	 | No equivalent | `<span>` |
| **code** | `<pre>` | three backticks (`` ` ``) with `{: .codeblock}` on the next line | `<pre class="codeblock"><code>` |
| **links** | `<xref>` + `<linktext>`  | `[linktext](url)` | `<a href="www.cloud.ibm.com">Cloud is amazing</a>` |	
| **italics** | `<i>` | `*italic*` or `_italic_` | `<em>` | 
| **bold** | `<b>` | `**bold**` | `<strong>` |	
| **monospace** | No equivalent | `` `monospace` `` (surrounded by single backticks) | `<code>` | 	
| **navigation** |  `<map>`	|	`toc.yaml`, see [Table of contents](toc)  |	toc.json |
| **topic reference** | `<topicref>` |	filename.md	|	`<a href>`	|
| **metadata** | `<data>`	 |	YAML definition at top of Markdown file |	`<meta>` inside `<head>` |
| **simple table** | `<simpletable>` | *table markup* |  `<table>` | 

## Sample Markdown file

Here is sample Markdown that can be processed with this markup table (file extension of *.md).
 
```markdown
---

copyright:
  years: 2015, 2021

lastupdated: "2021-09-01"

keywords: markdown markup

subcollection: writing

---

# Heading level 1
{: #heading-level}

The first paragraph that is also the short description.
{: shortdesc}

Here is an ordered list:

1. List item 1
2. List item 2

Here is a simple paragraph.  *Emphasized* and **strong** text can be defined within the paragraph.  [Links](https://markdown.sample.com/) can also be defined.

Here is an unordered list:

- List item 1
- List item 2

![Video title](https://www.youtube.com/embed/<video-ID>){: video output="iframe" data-script="none" id="youtubeplayer" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen}

Followed by a definition list.

term 1
:   Definition 1 for term 1.

term 2
:   Definition 2 for term 2.
:   Second part of definition for term 2.

And finally, a table.

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| row 1, cell 1 | row 1, cell 2 | row 1, cell 3 |
| row 2, cell 1 | row 2, cell 2 | row 2, cell 3 |
{: caption="Table 1. Table caption text" caption-side="top"}
```