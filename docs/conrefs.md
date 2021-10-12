# Content references

You might have common content that is needed in multiple topics within your doc set. You can leverage conrefs to write this content once and pull it into many Markdown topics in your same doc set. You cannot reuse content chunks across doc sets.

Content references (conrefs) can be leveraged for common content that is repeated within your doc set. A single `conref.md` file is defined for the reused source per doc set, and it must be at the root level of your repo.

There are limitations to what can be reused. Conrefs can only be leveraged for block content. For example, this means that you can reuse an entire list, but you cannot reuse a single list item in the list. Or, you can reuse an entire codeblock but you cannot reuse a code phrase in the middle of a sentence.

The following block-level content can be reused:
* A section (heading and all content under that heading)
* A paragraph (includes specialized paragraphs like callouts)
* A table
* A list (ordered or unordered)
* Code blocks

When reusing a section, all content under that heading will be pulled in until a heading at a higher or peer level is reached.

## Setting up conrefs for your docs

If you want to use conrefs in your docs the first thing you need to do is create a file named `conref.md`. There can only be one main `conref.md` file where all reused content will be authored. This file is not added to your `toc.yaml`.

Every block of content must have a unique ID set. That ID is what you reference when you identify to reuse the content within a Markdown topic with for format `{{site.data.content.my-shortdesc-reuse}}`.

## Example `conref.md` file

```markdown
---

copyright:
  years: 2015, 2021

lastupdated: "2021-08-27"

keywords: 

subcollection: overview

content-type: conref

---

{:shortdesc: .shortdesc}
{:codeblock: .codeblock}
{:pre: .pre}
{:screen: .screen}
{:tip: .tip}
{:note: .note}

# Content references for overview subcollection
{: #conref-example}

A short description that someone wanted to reuse across many topics.
{: shortdesc}
{: #my-shortdesc-reuse}

H1's would never be able to be reused. Each Markdown file can only ever have one H1. However, any H2-H6 can be fully reused.

## Full reused H2
{: #full-reused-h2}

This is just a paragraph in an h2 section.

I might also have a `specific` paragraph that I might want to reuse **many** times.
{: #paragraph-reuse}

I might have a note that I want to reuse in several topics.
{: note}
{: #note-reuse}

### Full reused H3
{: #full-reused-h3}

Maybe I have a bulleted list that I want to fully reuse an entire list. 

- List item one
- List item two
- List item three
{: #unordered-list-reuse}

### Second reused H3
{: #2-full-reused-h3}

The other thing teams might want to reuse is an entire table. Reuse of table components is not supported. It must be the full table.

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| row 1 cell 1 | row 1 cell 2 | row 1 cell 3 |
| row 2 cell 1 | row 2 cell 2 | row 2 cell 3 |
| row 3 cell 1 | row 3 cell 2 | row 3 cell 3 |
| row 4 cell 1 | row 4 cell 2 | row 4 cell 3 |
| row 5 cell 1 | row 5 cell 2 | row 5 cell 3 |
{: caption="Table 1. A caption for the table" caption-side="top"}
{: #table-reused}

## Second reused H2
{: #2-full-reused-h2}

I might want to reuse a code example.

Code phrases would not be able to be reused. Any `phrase level` markup wouldn't be intended to be reused.
```

### Example Markdown topic with a conref defined
{: #conrefs-example-topic}

```markdown
---

copyright:
  years: 2015, 2021

lastupdated: "2021-08-27"

keywords: 

subcollection: overview

---

{{site.data.keyword.attribute-definition-list}}

# Example topic that is reusing content
{: #example-topic}

{{site.data.content.my-shortdesc-reuse}}

## This is an H2 in the topic
{: #example-topic-h2}

This is some text that is in the topic.

Maybe I have a bulleted list that also is being reused:

{{site.data.content.unordered-list-reuse}}
```

## Troubleshooting conrefs

### Why is my content not being resolved?

If you have created a `conref.md` file and added references to IDs in `conref.md` from other Markdown files in your doc set, but the conrefs are not being resolved it is likely that you don't have the `conref.md` file set at the root. Make sure the file is directly under your repo folder name.

If you're running into this issue locally, it could be that your are processing more than one subcollection. For example, if you have the `md-source` directory and several subcollections in your `input` folder. Conrefs are designed to work on one doc set at a time. So, the marked-it code is likely expecting a `conref.md` file at the root `input` folder. Instead, run your test on one subcollection at a time.

### Why can't I set a conref for a phrase-level element?

Conrefs are not supported on phrase-level elements like a single list item, a code phrase, or even a table row.