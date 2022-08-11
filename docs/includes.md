# Includes

Includes is a way for you to reuse files or chunks of topics across doc sets. You can leverage includes to write this content once and pull it into many Markdown topics in different doc sets. 

If you want to restrict reuse to just your doc set, we recommend using [Content references](conrefs) and [Key references](keyrefs).

Unlike the limitations with Content references (conrefs) where you can just reuse block content from a single file named `conref.md`, with includes you can reuse entire files or chunks of topics.

## Reusing entire files

To reuse an entire file from another doc set you reference that file in your `toc.yaml` table of contents file. You define this with an `include` syntax and the path to the markdown file that you want to reuse.

```yaml
toc:
  properties:
    label: Markdown includes in marked-it

  entries:
  - topics:
    - index.md
    - subfolder/topic.md
    - topic: test.md
    navtitle: Test for Markdown changes
    - include: ../other-repo/reused-topic-full.md
    navtitle: Some other title if you wanted
    - include: ../other-repo/reused-topic-full2.md
    - include: ../other-repo/subfolder/reused-topic-full7.md
```

## Reusing chunks of a topic

You can reuse chunks of a topic in two ways: referencing a unique ID to a chunk of an existing topic or referencing a markdown file that just contains the segment.

### Referencing a unique ID

When referencing a unique ID to a chunk of an existing topic the implementation is the same as [Content references](conrefs) but it doesn't restrict you to just the `conrefs.md` file in your same doc set. 

There are limitations to what can be reused. Includes in this scenario can only be leveraged for block content. For example, this means that you can reuse an entire list, but you cannot reuse a single list item in the list. Or, you can reuse an entire codeblock but you cannot reuse a code phrase in the middle of a sentence.

The following block-level content can be reused:
* A section (heading and all content under that heading)
* A paragraph (includes specialized paragraphs like callouts)
* A table
* A list (ordered or unordered)
* Code blocks

When reusing a section, all content under that heading will be pulled in until a heading at a higher or peer level is reached.

Every block of content that you want to reuse and pull into your doc set with includes must have a unique ID set. That ID is what you reference when you identify to reuse the content within a Markdown topic with for format `{{../directory/topic-name.md#unique-ID}}`.

#### Example topic that is reusing content with includes
{: #includes-example-topic}

```markdown
---

copyright:
  years: 2015, 2023

lastupdated: "2022-08-11"

keywords: 

subcollection: overview

---

# Example topic
{: #example-topic}

{{site.data.content.my-shortdesc-reuse}}

## This is an H2 in the topic
{: #example-topic-h2}

This is some text that is in the topic.

Maybe I have a section that I want to reuse from another doc set:

{{../other-repo/reused-topic-with-sections.md#reused-h3}}
```

### Referencing a segment file

You might want to organize and maintain all reused content as individual markdown files. In each file, the markdown must be valid markup but can be a phrase, a sentence, or block-level content.

#### Example Markdown topic that is reusing content from an includes segment 
{: #includes-segment-example}

```markdown
---

copyright:
  years: 2015, 2023

lastupdated: "2022-08-11"

keywords: 

subcollection: overview

---

# Example topic
{: #example-topic}

This is my example topic.

## On that note
{: #on-that-note}

This section includes a note that's included from this repo.

{{_include-segments/reused-segment-note.md}}
```
