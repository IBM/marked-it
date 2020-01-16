---
title: What are attributes?
weight: 3
---

An attribute is a name or a name-value mapping that can be bound to a Markdown element. Attributes are subsequently passed through to the resulting generated HTML5 elements. They are often used to ensure correct CSS styling of the generated HTML5 output.

After your attributes are defined, you can apply these values to any Markdown element, like headers, paragraphs, and codeblocks.

Attributes, when defined and applied within a Markdown file, are output by marked-it by default. No additional parameters or flags need to be passed to the parser when the command is run.

marked-it-cli supports three types of attributes: ID attributes, class attributes, and custom attributes.

## ID attributes

Creates explicit IDs bound to HTML elements that can be used as anchors for linking.

### Use case

`marked-it-cli` dynamically generates a unique ID on all headers by default, but by explicitly controlling and overriding that value, we can create fixed ID anchors that are used for linking across multiple translated languages. Additionally this allows us to bind IDs to other elements as well.

#### Example input

```markdown
# How do I know that my data is safe?
{: #security}
```

#### Example output

```html
<h1 id="security">How do I know that my data is safe?</h1>
```

### Overriding ID values
An anchor ID is bound to a header by default, and it always uses the text of the header as its name. However, any time you want to override the anchor tag of a header by leveraging the ID attribute.

#### Example of default anchor bound to a header

Markdown source:
```markdown
## Visualizing your data sample
```

HTML5 output:
```html
<h2 id="visualizing-your-data-sample">Visualizing your data sample</h2>
```

#### Example of a custom attribute

Markdown source:
```markdown
## Visualizing your data sample
  {: #my-renamed-anchor}
```

HTML5 output:
```html
<h2 id="my-renamed-anchor">Visualizing your data sample</h2>
```

### Linking to a header entry example

You can link directly to a header within a file by using the header anchor ID. Use the automatically generated header value based on the text that is defined in the header, or add your own anchor ID to use for linking. The following example for linking uses user-defined ID anchors for each header, and the goal is to provide a link to content that is further down in the same file.

```markdown
# IBM Cloud
{: #cloud}

My short description links to the [Applications heading](filename.html#header_id).

## Services
{: #services}

## Applications
{: #applications}

I want to create a link within my short description that links to the second sub-heading, Applications.
To do this, I would use the following format: [Link text for header](filename.html#header_id).
For this example, I would use [Applications](readme.html#applications).
```


## Class attributes

Creates a `.class` value attribute bound to HTML elements that can used to style the bound attribute.

### Use case

The `.class` attribute provides consistent styling to HTML elements like `<code>`. We can provide additional CSS and UI functionality like providing a copy button to all `<code>` elements surround by the `<pre>` element when `<pre>` has the `class="codeblock"` attribute set. Alternatively, I could set the attribute `{: .screen}` on my Markdown code block, and when the HTML ouptuts to `<pre class="screen">`, our CSS will style the output like a screenshot, rather than code that was meant to be copied and reused. Class attributes provide CSS flexibility, and allow us to style a limited set of HTML output in unique ways.

#### Example input

```markdown
    ```java
    <dependency>
    <groupId>com.ibm.watson.developer_cloud</groupId>
    <artifactId>java-sdk</artifactId>
    <version>{version}</version>
    </dependency>
    ```
    {: .codeblock}
```

#### Example output

```html
<pre class="codeblock"><code class="lang-java hljs">  
<dependency>
<groupId>com.ibm.watson.developer_cloud&lt;/groupId>
<artifactId>java-sdk&lt;/artifactId>
<version>{version}&lt;/version>
</dependency>
</code></pre>
```

## Custom attributes

Creates a custom attribute value bound to HTML elements that can be used to provide custom styling.

### Use case

Custom attributes allow you to bind custom values to elements like blocks of HTML `<code>` and elements surrounding that code. This provides us with the ability to hide and display elements on the page depending on user selections. In the example below, the writer can define one set of code as Java and another as Node, which allows the user to filter the page based on the programming language they are interested in viewing.

#### Example input

```markdown
    ```java
    ClassifyOptions classifyOptions = new ClassifyOptions.Builder()
      .url("https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/640px-IBM_VGA_90X8941_on_PS55.jpg")
    .build();
    ClassifiedImages result = visualRecognition.classify(classifyOptions).execute();
    System.out.println(result);
    ```
    {: data-programlang='java'}
```

#### Example output

```html
<pre data-programlang="java"><code class="lang-java hljs">ClassifyOptions classifyOptions = <span class="hljs-keyword">new</span> ClassifyOptions.Builder() .url(<span class="hljs-string">"https://watson-developer-cloud.github.io/doc-tutorial-downloads/visual-recognition/640px-IBM_VGA_90X8941_on_PS55.jpg"</span>)
.build();
ClassifiedImages result = visualRecognition.classify(classifyOptions).execute();
System.out.println(result);
</code></pre>
```
