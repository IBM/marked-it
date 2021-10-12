# Footnotes

Footnote annotations can be added to content by adding a reference and a corresponding definiton in your Markdown source. 

Each footnote reference and definition is a pair. You can't reference the same footnote definition multiple times within a topic. If you do, an empty placeholder link will be generated, and the tooltip will not display.

If you want to add the same footnote in multiple places, define two separate footnote and definition pairs. The reference values must be different, but the definition text can be the same.

## Footnote reference limitations

Footnote references must follow these guidelines:
- Can only be used once in a topic
- Not allowed in headings or table headers
- Not allowed following links

## Footnote definition limitations

Footnote definitions must follow these guidelines:
- Limited to a single paragraph
- Should not nest list items or other complex markup
- Can contain `inline code` or links

## Creating a footnote

A footnote is comprised of a matching reference and definition. You can add footnotes to paragraphs, code phrases or blocks, table content, and lists or list items.

1. Create a footnote reference in the following format: `[^ reference]`. No matter what value you use for the reference, footnotes will always be automatically numbered in the order that they appear in your topic.

   A footnote reference must follow other attributes. For example, placing a footnote reference before a codeblock or external attribute will break the binding of the codeblock or external attribute to the element you are trying to associate it with.
1. On a new line, create a corresponding footnote definition in the following format: `[^ reference]: definition text (the text of the footnote)`. The reference value in the brackets (`[]`) must match the reference that you added in your content. Make sure the footnote definition is surrounded by blank lines.

## Footnote examples

```markdown
When a `PUT` request is successfully and synchronously used to replace an existing resource, a status of `200`[^200] OK MUST be returned. 

[^200]: [RFC 2616](https://tools.ietf.org/html/rfc2616#section-9.6){: external} requires that a successful resource update by a PUT request return either a `200` OK status or a `204` No Content status. Since this handbook requires that a successful PUT request of any kind return the resource as represented by a GET request to the same URI, only a `200` OK status is appropriate in this case.
```