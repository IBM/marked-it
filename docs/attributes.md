# Attributes

An attribute is a name or a name-value mapping that can be bound to a Markdown element. Attributes are subsequently passed through to the resulting generated HTML5 elements. They are often used to ensure correct CSS styling of the generated HTML5 output.

After your attributes are defined, you can apply these values to any Markdown element, like headers, paragraphs, and codeblocks.

Attributes, when defined and applied within a Markdown file, are output by marked-it by default. No additional parameters or flags need to be passed to the parser when the command is run.

marked-it-cli supports three types of attributes: ID attributes, class attributes, and custom attributes with `{.class #identifier attr=value attr2="spaced value"}`.

**ID attributes**
* Creates explicit IDs bound to HTML elements that can be used as anchors for linking.
* marked-it-cli dynamically generates a unique ID on all headers by default, but by explicitly controlling and overriding that value, we can create fixed ID anchors that are used for linking across multiple translated languages. Additionally this allows us to bind IDs to other elements as well.

**Class attributes**
* Creates a .class value attribute bound to HTML elements that can used to style the bound attribute.
* The .class attribute provides consistent styling to HTML elements like `<code>`. We can provide additional CSS and UI functionality like providing a copy button to all `<code>` elements surround by the `<pre>` element when `<pre>` has the `class="codeblock"` attribute set. Alternatively, I could set the attribute `{: .screen}` on my Markdown code block, and when the HTML ouptuts to `<pre class="screen">`, our CSS will style the output like a screenshot, rather than code that was meant to be copied and reused. Class attributes provide CSS flexibility, and allow us to style a limited set of HTML output in unique ways.

**Custom attributes**
* Creates a custom attribute value bound to HTML elements that can be used to provide custom styling.
* Custom attributes allow you to bind custom values to elements like blocks of HTML `<code>` and elements surrounding that code. This provides us with the ability to hide and display elements on the page depending on user selections. In the example below, the writer can define one set of code as Java and another as Node, which allows the user to filter the page based on the programming language they are interested in viewing.

## Attribute definitions

marked-it-cli supports both attributes and attribute definitions. Attribute definitions are page-level values that declare commonly-used attribute sets at the top of your Markdown file. Once an attribute definition is declared, it can be applied by name to any Markdown element on the same page.

```html
<!-- attribute definition format --> 
{:Name: #ID .Class Custom='custom attribute'}
<!-- example attribute definition --> 
{:java: #java .ph data-hd-programlang='java'}
```

`:Name:` The name of the attribute. This value does not get passed through to the output, it is an internal name that is used to map the attribute definition at the top of the page to one or more uses throughout the Markdown file. This value must be surrounded by colons (: :).

`#ID` Sets a value associated with the id attribute. This value is optional. If I define an ID of `#java` in my attribute, and I set this attribute on a Header, the HTML5 output will produce `<h1 id="java"></h1>`. This value must begin with a pound sign (#).

`.Class` Sets a value associated with the class attribute. This value is optional. If I define a class of `.ph` in my attribute, and I set this attribute on a header, the HTML5 output will produce `<h1 Class="ph"></h1>`. This value must begin with a period (.).

`Custom` Sets a custom attribute value. This value is optional. If I define a custom value of `data-programlang='java'` in my attribute, and I set this attribute on a aeader, the HTML5 output will produce `<h1 data-programlang='java'></h1>`.

Attribute definitions are defined at the top of your Markdown file. Each attribute definition must be enclosed in curly brackets, and must contain a unique name enclosed in a set of colons, followed by the definition: `{:Name: .class}`

While you can provide attribute definition values for ID, Class, and Custom, none of these values are required, and you can define any combination of these different attribute values. For example, I could bind the short description class to a paragraph like this:

```markdown
A paragraph of text followed by a return
{: .shortdescription}
```

Or, I can predefine the short description class as an attribute definition at the top of the page, and then refer to the name I give it. This means I could reuse it as many times on the page as I wanted. I have defined it as a class attribute in the definition, so when I set the attribute on the actual page, I can just call the attribute definition name, and not worry about if it’s a class or a custom attribute:

```html
<!-- Attribute definition -->
{:shortdesc: .shortdescription}

<!-- Lower on the page I have a paragraph followed by the attribute that calls the attribute definition above -->
A paragraph of text followed by a return
{: shortdesc}
```

> **Tip:** The name of the attribute definiton does not need to match the actual class or custom attribute. However, it is recommended to use the same value to make it easy to map between the definition and the attribute.

Attribute definitions are designed to make reusing a set of common attributes across the page easier. However, because all `#IDs` must be unique, we do not set ID attributes in definitions, as it would bind duplicate ID values on the same page. We tend to set IDs as a directly-bound attribute on Markdown elements, while defining most `.class` and custom attributes as attribute definitions.

## ID attributes

Even though the anchor ID is bound to a header by default, using the text of the header as its name, you can override it. To override the anchor tag of a header, you can use an attribute as described above. 

### Generated IDs for all headers
When marked-it-cli transforms Markdown to HTML5, it automatically binds an anchor ID to all header elements. Any time the parser transforms a Markdown file that contains a header, the HTML5 output of that header tag will produce an `id` attribute. Anchor IDs on headers provide writers with the ability to link directly to a subtopic that begins with a header.

For example, here is a level 4 header in Markdown:
```markdown
#### Content references in DITA vs Markdown
```
When the above Markdown is transformed into HTML5, the parser produces an ID with a value that is equal to the name of the header:
```html
<h4 id="content-references-in-dita-vs-markdown">Content references in DITA vs Markdown</h4>
```
> **Note:** Header anchor IDs are output by default. No additional parameters or flags need to be passed to the parser when the command is run.

