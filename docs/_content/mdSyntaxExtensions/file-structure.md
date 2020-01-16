---
title: Markdown file structure
weight: 0
---

Each `.md` file is considered a topic. In the HTML5 output, an `<article>` element is wrapped around all content within that file. And, that `<article>` element is wrapped in a `<body>` element.

There is always one and only one H1 in the file. 

H2s and H3s (and below) are considered sections and subsections of the topic.

The values of the heading entries are the titles. Each title should be assigned a unique ID (this is for translation and navigating reasons). The value of the H1 is copied to the `<title>` value in the HTML5 output.

The first paragraph after every H1 should be tagged as short description.
`{: .shortdesc}`