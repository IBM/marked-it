---
title: Applying attributes
weight: 5
---

## How do I apply attributes to Markdown markup?
After you define your attribute at the top of your Markdown file, you can apply the attribute by adding a call to the name of your attribute to the end of the Markdown tag you want to bind your attribute to. The implimentation of {{site.data.keyword.Bluemix_notm}} attribute usage is based on the Kramdown / Maraku Block/Span Inline Attribute Lists: http://kramdown.gettalong.org/syntax.html#inline-attribute-lists

**Note**: Not all attributes are applied to the end of the markdown element, for example if you are binding a custom code language class to a bullet it might be bound to the front of the element.

To apply a defined attribute, call the name of the attribute surrounded by curly brackets, and pre-pended by a colon and a space: `{: Name}`

For example:
I define a short description attribute at the top of my file and then apply it to a paragraph:
```markdown
{:shortdescription: .shortdesc}

This is a short description paragraph
{: shortdescription}
```

The Markdown parser will output HTML5 that looks like this:
```html
<p class="shortdesc">This is a short description paragraph</p>
```

**Note**: In almost all cases, add an empty line to your file following the attribute! Most common attributes must have an empty space following them. There are a few special cases where attributes bound to span elements must be on the same line.

## Position of attributes in relation to types of Markdown element

Not all attributes are applied to the end of the markdown element. This table clarifies position per type of element:


| Markdown element | Description | Attribute position |
|-----------|-------------|----------|
| Block-level elements and lists |  Block-level elements are blocks of text such as a paragraph or codeblock. Ordered and unordered lists in Markdown work the same as block-level elements when tagging the whole list. | Add the attribute tagging **immediately after the end of the block you want to tag, on a separate line**. If there are other attribute tags after the block, just add the context attribute, again on a separate line. |
| List items| If you want to tag an individual list item in an ordered or unordered list, you must apply the attribute differently than you do when applying it to the whole list. | To add an attribute to an individual list item, place the attribute tag immediately after the bullet character or number, for example: <br> `- {: python} This list item is for Python.` |
| Span-level elements |  Span-level elements include code phrases and links.  | For a span-level element, place the context tagging immediately after the element, **on the same line**, for example: <br> `python_attribute``{: python}`.  |

**Tip**: For any custom inline styling where you want to apply an attribute to a chunk of unstyled text in a paragraph, you can always use HTML to custom style arbitrary phrases.
