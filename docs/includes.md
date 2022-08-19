# Includes

Includes is a way for you to reuse entire files or chunks of topics across doc sets. You can leverage includes to write this content once and pull it into many Markdown topics in different doc sets. 

If you want to restrict reuse to just your doc set, we recommend using [Content references](conrefs) and [Key references](keyrefs).

Unlike the limitations with content references (conrefs) where you can reuse only block content from a single file named `conref.md`, with includes you can reuse entire files or chunks of topics.

## Reusing entire files

To reuse an entire file from another doc set, you reference that file in your `toc.yaml` table of contents file. You define this with an `include` syntax and the path to the markdown file that you want to reuse.

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
    - include: ../other-repo/subfolder/reused-topic-full3.md
```

At build time, marked-it outputs the included HTML into an `/includes/` folder in the output directory.

## Reusing chunks of a topic

You can reuse chunks of a topic in two ways: referencing a unique ID to a chunk of an existing topic or referencing a markdown file that just contains the segment.

### Referencing a unique ID

When referencing a unique ID to a chunk of an existing topic, the implementation is the same as [Content references](conrefs), but it doesn't restrict you to just the `conrefs.md` file in your same doc set. 

There are limitations to what can be reused. Includes in this scenario can only be leveraged for block content. For example, this means that you can reuse an entire list, but you cannot reuse a single list item in the list. Or, you can reuse an entire codeblock but you cannot reuse a code phrase in the middle of a sentence.

The following block-level content can be reused:
* A section (heading and all content under that heading)
* A paragraph (includes specialized paragraphs like callouts)
* A table
* A list (ordered or unordered)
* Code blocks

When reusing a section, all content under that heading will be pulled in until a heading at a higher or peer level is reached.

Every block of content that you want to reuse and pull into your doc set with includes must have a unique ID set. That ID is what you reference when you identify to reuse the content within a Markdown topic with format `{{../directory/topic-name.md#unique-ID}}`.

#### Example: Reusing part of another topic with includes

For example, say a peer `other-repo` folder contains a `reused-topic-with-sections.md` file with the following content:

```markdown
---

copyright:
  years: 2015, 2023

lastupdated: "2022-08-11"

---

# A topic in another repo
{: #other-repo-topic}

This is a topic that's in another doc set that has content that you want to reuse.

## Heading
{: #other-repo-topic-h2}

This subsection in turn has more subsections.

### Reused heading 3
{: #reused-h3}

This content and everything else in the same section, including nested sections, will be pulled in.

More content to pull in:

- This
- Will
- Be
- Reused
```

In the following topic, the `{{../other-repo/reused-topic-with-sections.md#reused-h3}}` tells marked-it to look in the peer `other-repo/reused-topic-with-sections.md` file and pull in all of the content that's associated with the `#reused-h3` ID.

```markdown
---

copyright:
  years: 2015, 2023

lastupdated: "2022-08-11"

---

# Example topic
{: #example-topic}

This is a topic that reuses a section of another topic.

## This is an H2 in the topic
{: #example-topic-h2}

This is some text that is in the topic.

Maybe I have a section that I want to reuse from another doc set:

{{../other-repo/reused-topic-with-sections.md#reused-h3}}
```

### Referencing a segment file

You might want to organize and maintain all reused content as individual files. With includes, you can create markdown segment files under an `_includes-segments` folder and then reuse them across your content. This enables you to chunk together content to be reused without assigning specific IDs to each piece. For example, a segment file might contain a list with an introductory paragraph or multiple paragraphs that belong together. 

In each of these markdown segment files, the markdown must be valid markup but can be any combination of phrases, sentences, or block-level content. Segment files should not contain a YAML header or other content that would disrupt the flow of the full markdown file where they are reused. You can use segment files from your own doc set and from another doc set.

#### Example: Reusing content from an includes segment 

For example, in the `_include-segments` folder, you might create the following `marked-it-perks.md` segment file:

```markdown
Great things about marked-it:

- It's fast
- It's versatile
- It's open source
```

In a full markdown topic, you can reuse the content from the segment file with the `{{_include-segments/marked-it-perks.md}}` reference. This incorporates all of the content in the segment file at build time.

```markdown
---

copyright:
  years: 2015, 2023

lastupdated: "2022-08-11"

---

# Example topic
{: #example-topic}

This is my example topic.

## On that note
{: #on-that-note}

This section includes some information about marked-it from a segment file in this repo.

{{_include-segments/marked-it-perks.md}}
```
