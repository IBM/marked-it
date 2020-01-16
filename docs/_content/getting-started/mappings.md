---
title: Markup mapping - Lightweight DITA, Markdown, HTML 5
weight: 4
---

The following table provides mappings between Lightweight DITA, Markdown, and HTML5.

|     Element     |   XDITA   | Markdown (Git-flavored)  |   HTML5      |
|-----------------|-----------|--------------------------|---------------|
| **container**    | `<topic>` | `No equivalent` added during transform        | `<article>`   |
| **title**       | `<title>` | `# ## ### ####`          | `<h1>...<h6> `|
| **short description** |`<shortdesc>` | No equivalent, but first  paragraph of text under the title with a `{.shortdesc}` attributef|`<p class="shortdesc">`|
| **body**|`<body>`|`No equivalent` added during  transform |`<body>`|
| **section** | `<section>` | `No equivalent` ##, ###, ####	 added for headings during transform  | `<section id="section-headingID”>` |
| **image**  | `<image>`	|	`![alt text](image.jpg)` | `<img>` |
| **video** | `<video>` | **Requirement** | `<video>` |	
| **footnote**  | `<fn>`	|	[^1]: This is the first footnote.  |	`<span data-class=“fn”>	<hr id="footnotesSeparator"><ol id="footnotesList"><li id="footnote-ID”>` |
| **note** | `<note>` 	|	`{:note: .note}`	|	`<div data-class=“note”><p class="note">This is a note paragraph.</p>`|
| **unordered list** | `<ul>` | `*` or `-`| `<ul><li></li></ul>` |
| **ordered list** | `<ol>` | `1.`<br>  `2.`<br> `3.` <br/><br/>| `<ol><li></li></ol>`|
| **list item** | `<li>` | Use the appropriate list type; nested lists are supported:<br> `1. Item 1`<br>&nbsp;`1. A corollary to the above item.`<br>&nbsp;`2. Yet another point to consider.`<br>`2. Item 2`<br>&nbsp;`* A corollary that does not need to be ordered.`<br> &nbsp;&nbsp;` * This is indented four spaces, because it's two spaces further than the item above.`<br>&nbsp;&nbsp; `* You might want to consider making a new list.`<br>`3. Item 3`| `<ol>`<br>`<li>`<br>`<ol>`<br>`<li>`<br>`<li>`<br>`</ol>`<br>`<li>`<br>`<ul>`<br>`<li>`<br>`<li>`<br>`</ul>`<br>`<li>`<br>`</ol>` |
| **definition list** | `<dl>` | **Requirement** (https://github.com/IBM/marked-it/issues/16) | `<dl>` |
| **term** | `<dt>` | **Requirement** (https://github.com/IBM/marked-it/issues/16) | `<dt>` |
| **definition** | `<dd>` | **Requirement** (https://github.com/IBM/marked-it/issues/16) | `<dd>` |
| **paragraph** | `<p>` | Paragraphs in Markdown are just one or more lines of consecutive text followed by one or more blank lines. | `<p>` |
| **phrase** | `<ph>`	 | `No equivalent` | `<span>` |
| **code** | `<pre>` | ` ``` ` (and `{: .pre}`) | `<pre class="codeblock"><code>` |
| **links** | `<xref>` + `<linktext>`  | `[link](url)` | `<a href="www.cloud.ibm.com">Cloud is amazing</a>` |	
| **italics** | `<i>` | `*italic*` | `<em>` | 
| **bold** | `<b>` | `**bold**` | `<strong>` |	
| **monospace** |  |``monospace`` | `<code>` | 	
| **navigation** |  `<map>`	|	toc		|	toc.json |
| **topic reference** | `<topicref>` |	filename.md	|	`<a href>`	|
| **metadata** | `<data>`	 |	YAML definition at top of Markdown file |	`<meta>` inside `<head>` |
| **simple table** | `<simpletable>` | Four types  of tables - see IBM extensions |  `<table>` | 

