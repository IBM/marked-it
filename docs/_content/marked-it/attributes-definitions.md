---
title: What are attribute definitions?
weight: 4
---

`marked-it-cli` supports both attributes and attribute definitions.  Attribute definitions are page-level values that declare commonly-used attribute sets at the top of your Markdown file.   Once an attribute definition is declared, it can be applied by name to any Markdown element on the same page.

The `marked-it-cli` attribute definitions implementation is based on [Kramdown / Maruku Attribute Definiton](http://kramdown.gettalong.org/syntax.html#attribute-list-definitions).

For example:
```markdown
<!-- attribute definition format --> 
{:Name: #ID .Class Custom='custom attribute'}
<!-- example attribute definition --> 
{:java: #java .ph data-hd-programlang='java'}
```

* **:Name:** is the name of the attribute. This value does not get passed through to the output, it is an internal name that is used to map the attribute definition at the top of the page to one or more uses throughout the Markdown file. This value must be surrounded by colons (`: :`).
* **#ID** sets a value associated with the `id` attribute. This value is optional. If I define an ID of `#java` in my attribute, and I set this attribute on a Header, the HTML5 output will produce `<h1 id="java"></h1>`. This value must begin with a pound sign (`#`).
* **.Class** sets a value associated with the Class attribute. This value is optional. If I define a Class of `.ph` in my attribute, and I set this attribute on a Header, the HTML5 output will produce `<h1 Class="ph"></h1>`. This value must begin with a period (`.`).
* **Custom** sets a custom attribute value. This value is optional. If I define a Custom value of `data-programlang='java'` in my attribute, and I set this attribute on a Header, the HTML5 output will produce `<h1 data-programlang='java'></h1>`. 


## How do I code attribute definitions?

Attribute definitions are defined at the top of your Markdown file. Each attribute definition must be enclosed in curly brackets, and must contain a unique name enclosed in a set of colons, followed by the definition: 
`{:Name: .class}`

While you can provide attribute definition values for ID, Class, and Custom, none of these values are required, and you can define any combination of these different attribute values. For example, I could bind the short description class to a paragraph like this:

```markdown
A paragraph of text followed by a return
{: .shortdescription}
```

Or, I can predefine the short description class as an attribute definition at the top of the page, and then refer to the name I give it. This means I could reuse it as many times on the page as I wanted. I have defined it as a class attribute in the definition, so when I set the attribute on the actual page, I can just call the attribute definition name, and not worry about if it's a class or a custom attribute:

```markdown
<!-- Attribute definition -->
{:shortdesc: .shortdescription}

<!-- Lower on the page I have a paragraph followed by the attribute that calls the attribute definition above -->
A paragraph of text followed by a return
{: shortdesc}
```

**Notes**:
1. The name of the attribute definiton does not need to match the actual class or custom attribute.  However it is recommended to use the same value to make it easy to map between the definition and the attribute.
2. Attribute definitions are designed to make reusing a set of common attributes across the page easier. However, because all #IDs must be unique, we do not set ID attributes in definitions, as it would bind duplicate ID values on the same page. We tend to set IDs as a directly-bound attribute on Markdown elements, while defining most `.class` and custom attributes as attribute definitions.

### Class attribute definition example:

    <!-- Sample attribute definition --> 
    {:codeblock: .codeblock}

    <!-- A block of code with attribute bound to it --> 
    ```
    foo == bar
    ```
    {: codeblock}


### Custom attribute definition example:

    <!-- Sample attribute definition --> 
    {:java: data-programlang='java'}


    <!-- A block of java code with an attribute bound to it --> 

    ```java
    IamOptions options = new IamOptions.Builder()
      .apiKey("{apikey}"{: apikey})
      .build();

    VisualRecognition visualRecognition = new VisualRecognition("2018-03-19", options);

    ClassifyOptions classifyOptions = new ClassifyOptions.Builder()
      .url("https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/640px-IBM_VGA_90X8941_on_PS55.jpg")
      .build();
    ClassifiedImages result = visualRecognition.classify(classifyOptions).execute();
    System.out.println(result);
    ```
    {: java}
