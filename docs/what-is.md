# What is marked-it?

The marked-it generator starts with using [markdown-it](https://github.com/markdown-it/markdown-it) and then leverages the extension plug-in model to add IBM-specific syntax implementation. Beyond this, marked-it provides various extended capabilities, including:
* Markdown source support for Kramdown-style attributes 
* Markdown source support for Jekyll-style front matter 
* HTML generation hooks for customizing the generated output
* Variable substitutions with values from either front matter or API arguments
* Table of contents file creation and management

For details on the marked-it API, see the [API reference](https://github.com/IBM/marked-it#api).

## marked-it CLI

marked-it-cli is a command-line tool for processing a directory tree of Markdown source and generating the corresponding HTML content.  marked-it-cli uses [marked-it](/marked-it/index) for its HTML generation, and therefore inherits its support for extended markdown syntaxes like [Kramdown-style attributes](/marked-it/marked-it/attributes/) and [Jekyll-style front matter](/marked-it/marked-it/frontMatter/).  marked-it-cli also has features for reading variables from content reference files, specifying extensions for hooking into the generation process, and creating Table of Contents files.

> **Tip:** marked-it-cli is a superset. So, if you install marked-it-cli, you also get all the features and functions of marked-it.

marked-it-cli uses [semantic versioning](http://semver.org/).