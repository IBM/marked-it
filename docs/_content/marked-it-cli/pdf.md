---
title: PDF output
---

For PDF file generation to succeed, [wkhtmltopdf](http://wkhtmltopdf.org/ "wkhtmltopdf home") must be installed and the path to its binary must be in the OS's PATH environment variable.  

**Note:** On Windows, the wkhtmltopdf arch (32-/64-bit) must match that of the Node.js being used.

If `--pdfOptionsFile` is not specified then all default options will be used.  Custom options are specified in strict JSON format as the camel-cased equivalents of the options described in the [wkhtmltopdf options](http://wkhtmltopdf.org/usage/wkhtmltopdf.txt).  For an example, see the included file `example/examplePDFoptions`.

## Example

The "examples" directory demonstrates the CLI's features.  To generate it, run the following command:
```js
node ./bin/marked-it-cli ./example --output=./exampleOutput --extension-file=./example/headerFooterExt.js --gen-pdf --pdf-options-file=./example/pdfOptions --conref-file=./example/conref.yml --toc-xml
```
