---
title: Styling external links
weight: 5
---

IBM Cloud supports the following styling applied to fully qualified links that you want to open in a new window:

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{:external: target="_blank" .external}` |  The `{: external}` attribute outputs `<a class="external" target="_blank">`, and when rendered in the IBM Cloud doc app, the CSS will add an external image graphic to the end of the URL. Use this whenever you are linking to content outside of the doc app. **Note**: The `{: external}` attribute must be bount to the end of the external link, and is not placed on the next line. | On the same line, no space, following the link |
| `{:new_window: target="_blank"}` | The `{: new_window}` element is deprecated and should be replaced with  The `{: external}` attribute | n/a |

#### Example input

```markdown
<!-- Attribute definition --> 
{:external: target="_blank" .external}
   

[Choosing the best option for you](https://www.ibm.com/cloud/blog/){: external}

```   

#### Example output 

```html
<--HTML5 output-->
<a href="https://www.ibm.com/cloud/blog/" target="_blank" class="external">Choosing the best option for you</a>

```