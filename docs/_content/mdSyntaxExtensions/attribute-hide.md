---
title: Attributes for including and excluding content based on publish location
weight: 8
---

There might be situations where you want to single source your content and include or exclude a portion based on where the content is publishing.

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{hide-in-docs: .hide-in-docs}` |  The `{: hide-in-docs}` element outputs `class="hide-in-docs"`, and when rendered in the IBM Cloud doc app, the CSS will not display this content. Requires the use of the `{: notoc}` attribute as well to hide H2s and H3s from the navigation.  | On a new line following the content you want to hide. |
| `{hide-dashboard: .hide-dashboard}` | The `{: hide-dashboard}` element outputs `<class="hide-dashboard"`, and when rendered in the IBM Cloud doc app, the CSS will ignore this class attribute. However, when content is reused in the dashboard, the IBM Cloud console will hide any content tagged with this attribute. | On a new line following content you want to render in the doc app but hide in the IBM Cloud console service dashboard. |
| `{:apikey: `data-credential-placeholder`='apikey'}` |  The custom `{: apikey}` element outputs `data-credential-placeholder="apikey">`, and when rendered in the IBM Cloud console dashboard, services that supoprt this function will replace the placeholder apikey with a users real API key. | Typically placed right after the value you want to use as a placeholder for an API key; in most cases this will directly follow a span-level element. For example, `IAMApiKey: "{apikey}"{: apikey}` |

Setting `class="hide-in-docs"` on any element hides that content from display within in the doc app. It is still available in the HTML output and will show when used anywhere outside of the doc app, including the {{site.data.keyword.Bluemix_notm}} console. You must define `{:hide-in-docs: .hide-in-docs}` in the attribute list definition at the top of your *.md file. Then, set `{: hide-in-docs}` on any paragraph, list item, and so on.

**Important**: When using `{: hide-in-docs}` on any H2 or H3 header, the content will be hidden, but the table of contents entry will display. To use `{: hide-in-docs}` with H2 or lower, you should also apply the `{: notoc}` attribute on a new line following the `{: hide-in-docs}` declaration.

####  Example input

This following example will not show up in the doc app but will show up outside of the doc app. When marked-it-cli transforms this markdown source into HTML5, it will bind the custom class="notoc" to the H2 element. Next marked-it-cli will transform the toc file into a toc.json file, and it will use the headers in the generated HTML5 output to build that toc. If it sees the `class="notoc"`attribute it will not generate a toc entry in the corresponding toc.json output for that header.

```markdown
## This H2 and all content within it will be hidden
{: hide-in-docs}
{: notoc}

Text here will not show up in the doc app but will show up outside the doc app.
The toc entry in the doc app will also be hidden.
```