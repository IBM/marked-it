---
title: Table of Contents
weight: 7
---

In addition to the standard HTML5 output that marked-it produces from each Markdown file, the parser can also produce a Table of Contents file in different formats. 

Each TOC entry produced from a Markdown topic contains a nested set of structured headers or topicrefs that match the structure of headers in the original markdown source. Each TOC header or topicref also contains a link to a corresponding header anchor ID in the HTML5 output file that was generated from the Markdown source.

By default, for each Markdown file processed by the generator, the following files are output:

**Source:** 
* `*.md`: Each Markdown file included in your collection. Each H1 will be the parent entry in the `toc` file and all subsequent headings are pulled  in as children entries during processing.
* `toc`: Defines the order of each Markdown file in your collection. The `toc` file has no file extension.


**Output:**
* `index.HTML`: Standard HTML5 output for each Markdown file.
* `toc.xml`: XML format with nested headers matching each header in index.md. Each header contains a link to a corresponding header anchor ID in index.HTML.
* `toc.json`: JSON format with nested headers matching each header in index.md. Each header contains a link to a corresponding header anchor ID in index.HTML.

**Note:** Each TOC format is produced and structured following the conventions of that format. Headers must be incremented by only a single level, and any headers in your Markdown that skip a level (for example, H1 to H3, skipping H2) will not produce a valid `toc` output. Header values can decrease by skipping a level (for example, H3 to H1, skipping H2) but they cannot increase.

To disable TOC files, add the following parameter: `-disableToc`

##  `toc` file format
The `toc` file includes a definition at the top, followed by listing the Markdown files in the order that you want them navigated.  Optionally, you can add attribute defintions at the top of the file, such as `:external:` in the following example.

**Note:** IBM Cloud supports two custom additions to the `toc` file: navgroups and topicgroups

```markdown
{:external: target="_blank" .external}

{: .toc collection="collection-name" category="category-value" audience="audience-value" href="URL-for-docs"} 
Collection Title

getting-started.md
[What is continuous delivery?](https://www.ibm.com/cloud/learn/continuous-delivery){: external}
```

