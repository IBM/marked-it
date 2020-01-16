---
title: Styling callouts
weight: 4
---

IBM Cloud supports custom styling for callouts, including: Note, Tip, Important, and Deprecated. Attributes are applied to paragraphs of text, and these attributes will output bound to the HTML5 `<p>` element:

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{:note: .note}` |  The `{: note}` element outputs `<p class="note">`, and when rendered in the IBM Cloud doc app, the CSS will surround the text with a custom color box and display an icon followed by **Note** and your text. | On a new line following the paragraph. |
| `{:tip: .tip}` | The `{: tip}` element outputs `<p class="tip">`, and when rendered in the IBM Cloud doc app, the CSS will surround the text with a custom color box and display an icon followed by **Tip** and your text.   | On a new line following the paragraph. |
| `{:important: .important}` |  The `{: important}` element outputs `<p class="important">`, and when rendered in the IBM Cloud doc app, the CSS will surround the text with a custom color box and display an icon followed by **Important** and your text. | On a new line following the paragraph. |
| `{:deprecated: .deprecated}` |  The `{: deprecated}` element outputs `<p class="deprecated">`, and when rendered in the IBM Cloud doc app, the CSS will surround the text with a custom color box and display an icon followed by **Deprecated** and your text. | On a new line following the paragraph. |
| `{:preview: .preview}` |  The `{: preview}` element outputs `<p class="preview">`, and when rendered in the IBM Cloud doc app, the CSS will surround the text with a custom color box and display an icon followed by **Service release** and your text. | On a new line following the paragraph. |


Use the **Deprecated** callout to draw attention to a service that's deprecated or some feature or function deprecation. Include it at the top of the topic. If you're using the callout for a deprecated service, include it at the top of **each** topic, for example:

This service was deprecated on 2018 May 17. 
{: deprecated} 

Use the **Important** callout to draw attention to crucial information, for example:

You cannot access classic infrastructure pages on https://cloud.ibm.com if you have restricted IP addresses. You must go to https://control.softlayer.com.
{: important}

Use the **Note** callout to draw attention to extra information that's not crucial or a shortcut, for example:

This tutorial is for IAM-enabled resources. For services that don't support creating Cloud IAM policies for managing access, you can use [Cloud Foundry access](/docs/iam/cfaccess.html#cfaccess) or [classic infrastructure permissions](/docs/iam/infrastructureaccess.html#infrapermission).
{: note}

Use the **Tip** callout to draw attention to information that provides a shortcut or additional assistance for the user, for example: 

To easily find the user you're looking for, click **Filter** and filter by given name, surname, or user name.
{: tip}

Use the **Select Availability** callout to draw attention to a production-ready offering that is available for sale and accessible to select customers. Include it at the top of your getting started tutorial. Do not use this callout for a beta offering. Check with your Offering Management and Marketing teams on the exact wording to use. See the following example:

{{site.data.keyword.cloud}} enterprise is available for select customers. Contact IBM Sales if you are interested in purchasing and using this offering.
{: preview}

## How to use the callout attribute

1.  Define the callout attribute at the top of your file: (e.g., `{:tip: .tip}` or `{:important: .important}`).
1.  Add the callout attribute to the line following a paragraph of text you want to style (e.g., `{: tip}`).
    * Make sure that the attribute is on the next line following the paragraph.
    * Always add an empty line following the attribute. Attributes must have an empty space following them.
    * If the callout is the last line of your file, add a blank line to to the end of your file. You can enforce this with editors such as Atom or VS Code.


`bunch of text. Go to new line`    
`{: tip}`    
    
`Your next paragraph after a blank line`

We recommend not using italics to style text within callouts, especially when combined with an external link. In this edge-case we see the markdown generator getting confused by the `_blank` value in new window and the use of `_` (underscore) to surround text and style it in italics. To maximize your success, if you do use italics within a callout, DO NOT use underscore, and instead use asterix. 
{: note}