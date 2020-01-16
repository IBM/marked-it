---
title: Styling short description
weight: 6
---

IBM Cloud supports the following styling applied to a paragraph of text that introduces your topic:

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{:shortdesc: .shortdesc}` |  The `{: shortdesc}` element outputs `<p class="shortdesc">`, and when rendered in the IBM Cloud doc app, the CSS will pad the paragraph with a slightly larger surrounding white space. Only use this on your first paragraph. | On a new line following the paragraph |

#### Example input

```markdown
<!-- Attribute definition --> 
{:shortdesc: .shortdesc}
   
The short description should highlight the overall topic.
{: shortdesc}

```   

#### Example output

```html
<--HTML5 output-->
<p class="shortdesc">The short description should highlight the overall topic.</p>

```