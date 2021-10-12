# Table of contents

In addition to the standard HTML5 output that marked-it produces from each Markdown file, the parser can also produce a Table of Contents file in different formats. 

Each TOC entry produced from a Markdown topic contains a nested set of structured headers or topicrefs that match the structure of headers in the original markdown source. Each TOC header or topicref also contains a link to a corresponding header anchor ID in the HTML5 output file that was generated from the Markdown source.

By default, for each Markdown file processed by the generator, the following files are output:

**Source:** 
* `*.md`: Each Markdown file included in your collection. Each H1 will be the parent entry in the `toc` file and all subsequent headings are pulled  in as children entries during processing.
* Table of contents file (use one of the following)
   * `toc`: Defines the order of each Markdown file in your collection. The `toc` file has no file extension.
   * `toc.yaml`: Defines the order of each Markdown file in your collection. Follows YAML syntax.


**Output:**
* `file.html`: Standard HTML5 output for each Markdown file.
* Table of contents file (select the format you want to use)
   * `toc.xml`: XML format with nested headers matching each header in index.md. Each header contains a link to a corresponding header anchor ID in index.HTML.
   * `toc.json`: JSON format with nested headers matching each header in index.md. Each header contains a link to a corresponding header anchor ID in index.HTML.

> **Note:** Each TOC format is produced and structured following the conventions of that format. Headers must be incremented by only a single level, and any headers in your Markdown that skip a level (for example, H1 to H3, skipping H2) will not produce a valid `toc` output. Header values can decrease by skipping a level (for example, H3 to H1, skipping H2) but they cannot increase.

To disable TOC files, add the following parameter: `-disableToc`

## `toc` file format 

> **Note:** The extensionless `toc` file format is the original table of contents source format, and has been marked deprecated. We've replaced it with the `toc.yaml` format for easier authoring and automated testing.

The `toc` file includes a definition at the top, followed by listing the Markdown files in the order that you want them navigated.  Optionally, you can add attribute defintions at the top of the file, such as `:external:` in the following example.

**Note:** IBM Cloud supports two custom additions to the `toc` file: navgroups and topicgroups

```markdown
{:external: target="_blank" .external}

{: .toc collection="collection-name" category="category-value" audience="audience-value" href="URL-for-docs"} 
Collection Title

getting-started.md
[What is continuous delivery?](https://www.ibm.com/cloud/learn/continuous-delivery){: external}
```

## `toc.yaml` file format

The toc.yaml file defines the organization of your doc set and includes metadata about your content. Each section within the YAML file is a list of definitions needed to fully define your documentation. marked-it outputs the `toc.yaml` to `toc.json` (and there's a `toc.xml` output option too).

The schema for the toc.yaml always begins with a `toc` entry. And, the first list is the metadata to describe your doc set. This list is named `properties` and can be any facets needed for your environment.

The next section is an array of all the topics in your doc set, ordered how you want them to appear in your navigation. This array is named `entries`. There can be different array types defined within the `entries`, mainly `topics` and `links`.

`topics` is an ordered list of topics that you want to include within your table of contents, including nesting.

```yaml
topics:
- topic1.md
- topic2.md
- topic3.md
```

Each topic can also have a peer `navtitle` property. When setting a `navtitle`, you must prefix the topic object with `topic:`. If this property is not included the h1 value will be set as your topic label in the table of contents.

```yaml
topics:
- topic: topic1.md
  navtitle: My custom toc label
- topic2.md
- topic3.md
```

`links` is an ordered list of external links that you want to appear within your table of contents. Included are the properties of the link consisting of the link label and the link href.

```yaml
links:
- link:
    label: Link Label 1
    href: https://link1.com
- link:
    label: Link Label 2
    href: https://link2.com
```

If you are mixing a link within a `topics` array, you don't include the `links` array. Instead, you just add the link entry as a peer to the topic entries. For example:

```yaml
topics:
- topic1.md
- topic2.md
- link:
    label: Link Label 1
    href: https://link1.com
- topic3.md
```

### Formatting of the `toc.yaml`

Indentation is how YAML denotes nesting. Two space indentation is supported. Tabs are not supported.

The following is an example of the correct indentation for the `toc.yaml` schema:

```yaml
---
toc:
  properties:
    facet1: value1
    facet2: value2
    facet3: value3
    label: Doc set title

  entries:
    topics:
    - topic: topic1.md
      navtitle: My custom toc label
    - topic2.md
    - topic3.md
    links:
    - link:
        label: Link Label 1
        href: https://link1.com
    - link:
        label: Link Label 2
        href: https://link2.com
```