---
title: How do I run marked-it-cli?
weight: 2
---

### Syntax

```bash
marked-it-cli <sourceDirectory> --output=<destinationDirectory> [OPTIONS]
```

### Required arguments

- `<sourceDirectory>`:
	The path of the directory containing source Markdown files.  Subdirectories are recursed.
	
- `--output`:
	The path of the directory to write generated files to.  Directory structures from the source directory will be replicated here.


### Options

| `marked-it-cli` arguments | Details | 
|-----|-----|
| --output | Specifies the output directory |
| --header-file | Specifies the `header.txt` file you want to append to the top of each of your generated HTML5 files. |
| --footer-file | Specifies the `footer.txt` file you want to append to the end of your generated HTML5 files. |
| --conref-file | Specifies the conref YAML file you want to use as your list of product variables that will programatically replace attribute calls in your Markdown topics. |
| --extension-file=./example/generateSectionsExt.js | Produces HTML `<section>` tags surrounding each header, allowing for more granular HTML reuse. <br> **Note**: Extensions are packaged in the parser and can be found in `cd node_modules/marked-it-cli/example`.  |
| --extension-file=./example/accessibilityExt.js | An accessibility extension required to correctly handle limitations in Markdown. This is included with the Markdown generator in the examples directory. <br> **Note**: Extensions are packaged in the parser and can be found in `cd node_modules/marked-it-cli/example`.  |
| --extension-file=./example/xmlTocExt.js | Creates an XML formatted toc file. This is included with the Markdown generator in the examples directory. |
| --toc-xml | Works with `xmlTocExt.js` to generate the `toc.xml` file. <br> **Note**: Extensions are packaged in the parser and can be found in `cd node_modules/marked-it-cli/example`. |
| --extension-file=./example/jsonTocExt.js | Creates a JSON formatted toc file. This is included with the Markdown generator in the examples directory. |
| --toc-json | Works with `jsonTocExt.js` to generate the `toc.json` file. <br> **Note**: Extensions are packaged in the parser and can be found in `cd node_modules/marked-it-cli/example`. |
| --overwrite | Allows you to write new HTML5 files to the same directory over the top of exisiting files. |
