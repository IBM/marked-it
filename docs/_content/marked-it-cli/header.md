---
title: Headers and footers
weight: 6
---

You may need to define copyright and other metadata to prepend or append uniformly across the generated HTML5 output. You can use standard header and footer files that are called during transformation. In addition, you might need to add HTML opening and closing tags for the file based on your publishing requirements. These opening and closing HTML tagging is added with a `header` and `footer` file that is called by the generator: `--headerFile=header --footerFile=footer`

The `header` file is prepended to the generated `.html`. The `footer` file is appended to the generated `.html`.

### Header and footer extension
Each Markdown file can have a header YAML definition at the top where you can define metadata.

You might want to dynamically pull in values from your Markdown file into the header or footer. An example of how to do this can be found in `.examples/headerFooterExt.js`.

### Example header.txt file
{% raw %}
```html
<!DOCTYPE html><html lang="{{ lang }}">
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<meta name="keywords" content="{{ keywords }}">
<meta name="description" content="{{ shortdesc }}">
<meta name="source.format" content="markdown">

<title>{{ document.title.text }}</title>
</head>
<body>
<main role="main">
<article aria-labelledby="{{ document.title.id }}" role="article">
```
{% endraw %}

### Example of a footer file
{% raw %}
```html
<footer>
    <div>
      <p>Copyright &copy; {{ copyright.year }}. All Rights Reserved.</p>
    </div>
  </footer>
</body>
</html>
```
{% endraw %}

## Generated IDs for all headers
When marked-it-cli transforms Markdown to HTML5, it automatically binds an anchor ID to all header elements. Any time the parser transforms a Markdown file that contains a header, the HTML5 output of that header tag will produce an `id` attribute. Anchor IDs on headers provide writers with the ability to link directly to a subtopic that begins with a header.

For example, here is a level 4 header in Markdown:
```markdown
#### Content references in DITA vs Markdown
```
When the above Markdown is transformed into HTML5, the parser produces an ID with a value that is equal to the name of the header:
```html
<h4 id="content-references-in-dita-vs-markdown">Content references in DITA vs Markdown</h4>
```
**Note:** Header anchor IDs are output by default. No additional parameters or flags need to be passed to the parser when the command is run.

### Customizing an anchor ID on a header
Even though the anchor ID is bound to a header by default, using the text of the header as its name, you can override it. To override the anchor tag of a header, you can use an attribute. See the [ID attributes](/attributes/#id-attributes) for more details.
