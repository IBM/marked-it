# Headers and footers

You may need to define copyright and other metadata to prepend or append uniformly across the generated HTML5 output. You can use standard header and footer files that are called during transformation. In addition, you might need to add HTML opening and closing tags for the file based on your publishing requirements. These opening and closing HTML tagging is added with a `header` and `footer` file that is called by the generator: `--headerFile=header --footerFile=footer`

The `header` file is prepended to the generated `.html`. The `footer` file is appended to the generated `.html`.

### Header and footer extension
Each Markdown file can have a header YAML definition at the top where you can define metadata.

You might want to dynamically pull in values from your Markdown file into the header or footer. An example of how to do this can be found in `.examples/headerFooterExt.js`.

### Example header.txt file

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


### Example of a footer file

```html
<footer>
    <div>
      <p>Copyright &copy; {{ copyright.year }}. All Rights Reserved.</p>
    </div>
  </footer>
</body>
</html>
```