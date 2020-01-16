---
title: What is marked-it?
weight: 1
---

marked-it is a node.js module.  The API takes Markdown content and returns the corresponding HTML5 output.

Beyond its core Markdown-to-HTML generation, marked-it provides various extended capabilities, including:
- Markdown source support for Kramdown-style attributes ([details](https://ibm.github.io/marked-it/marked-it/attributes/))
- Markdown source support for Jekyll-style front matter ([details](https://pages.github.ibm.com/cloud-doc-build/test-marked-it-spec/marked-it/attributes-definitions/))
- HTML generation hooks for customizing the generated output
- Variable substitutions with values from either front matter or API arguments
- Table of contents file creation and management ([details](https://pages.github.ibm.com/cloud-doc-build/test-marked-it-spec/marked-it-cli/toc/))

## Is marked-it accessible?
Yes. We've implemented code to make our output fully accessible. Some examples of accessibility additions are:
- Alt text for images. Alt text is already included by default as part of the Markdown tagging for images. But, we've also added a caption extension.
- Header row in tables. The HTML transform turns the first row into `<thead>`.
- The `aria-label`. Elements having a WAI-ARIA 'article' role must have a label specified with `aria-label` or `aria-labelledby`. The `<article>` element and label are added during transform to HTML5.

For image captions and table header code examples, see the `./examples/accessibilityExt.js` extension file.
