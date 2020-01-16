---
title: Getting started
weight: 1
---

marked-it-cli is a command-line tool for processing a directory tree of Markdown source and generating the corresponding HTML content.  marked-it-cli uses [marked-it](/marked-it/index) for its HTML generation, and therefore inherits its support for extended markdown syntaxes like [Kramdown-style attributes](/marked-it/marked-it/attributes/) and [Jekyll-style front matter](/marked-it/marked-it/frontMatter/).  marked-it-cli also has features for reading variables from content reference files, specifying extensions for hooking into the generation process, and creating Table of Contents files.

**Tip:** marked-it-cli is a superset. So, if you install marked-it-cli, you also get all the features and functions of marked-it.

## Installation

1. If you don't already have it, install [node.js](https://nodejs.org/en/download/).
2. At a command-line: `npm install -g marked-it-cli`

marked-it-cli uses [semantic versioning](http://semver.org/).
