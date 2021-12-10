# How do I run marked-it-cli?

As of version 2.0.0, `marked-it-cli` uses [markdown-it](https://github.com/markdown-it/markdown-it) as the core dependency. Previous versions of `marked-it-cli` used [marked](https://github.com/markedjs/marked) as the core dependency, but after version 0.25.1 you have the option of using either. 

## Before you begin

If you want to use a previous version of marked-it, you can control which core dependency you use by setting the `VERSION` environment variable before you run `marked-it-cli`. However, core dependency selection is available only in `marked-it-cli` 0.25.1 and later. Previous versions of `marked-it-cli` support only `marked`.

- `VERSION=2` sets `markdown-it` 
- `VERSION=1` sets `marked` 

For example, if you're running `marked-it-cli` 0.29.13 but want to use the updated `markdown-it` and associated features, set the environment variable by running the following command:

```bash
export VERSION=2
```

If you are using version 2.0.0, you do not need to set the version environment variable.

## `marked-it-cli` command

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
| --conkeyref-file | Specifies the conkeyref YAML file you want to use as your list of product variables that will programatically replace attribute calls in your Markdown topics. |
| --extension-file=./example/generateSectionsExt.js | Produces HTML `<section>` tags surrounding each header, allowing for more granular HTML reuse. <br> **Note**: Extensions are packaged in the parser and can be found in `node_modules/marked-it-cli/example`.  |
| --extension-file=./example/accessibilityExt.js | An accessibility extension required to correctly handle limitations in Markdown. This is included with the Markdown generator in the examples directory. <br> **Note**: Extensions are packaged in the parser and can be found in `node_modules/marked-it-cli/example`.  |
| --extension-file=./example/xmlTocExt.js | Creates an XML formatted toc file. This is included with the Markdown generator in the examples directory. |
| --toc-xml | Works with `xmlTocExt.js` to generate the `toc.xml` file. <br> **Note**: Extensions are packaged in the parser and can be found in `node_modules/marked-it-cli/example`. |
| --extension-file=./example/jsonTocExt.js | Creates a JSON formatted toc file. This is included with the Markdown generator in the examples directory. |
| --toc-json | Works with `jsonTocExt.js` to generate the `toc.json` file. <br> **Note**: Extensions are packaged in the parser and can be found in `node_modules/marked-it-cli/example`. |
| --overwrite | Allows you to write new HTML5 files to the same directory over the top of exisiting files. |
| --verbose | Runs the parser with full logging output. |

