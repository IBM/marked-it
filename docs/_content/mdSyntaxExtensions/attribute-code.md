---
title: Styling code
weight: 3
---

IBM Cloud supports the following styling applied to code blocks surrounded by three backquotes (``` ``` ```), and these attributes will output bound to the HTML5 `<pre>` element:

| Attribute | Description | Position |
|-----------|-------------|----------|
| `{:codeblock: .codeblock}` |  The `{: codeblock}` element outputs `<pre class="codeblock">`, and when rendered in the IBM Cloud doc app, the CSS will add a copy button to the block of code it surrounds. Use this for basic chunks of code you want to make easy to copy and reuse. | On a new line following the code encapsulated in three back backquotes (` ``` `). |
| `{:pre: .pre}` | The `{: pre}` element outputs `<pre class="pre">`, and when rendered in the IBM Cloud doc app, the CSS will add a copy button to the block of code it surrounds. Additionally, `<pre class="pre">` will prepend the code example with a `$`. This is a visual indicator only, and does not copy through into the buffer when you click the copy button. Use this for commands you expect users to copy, paste, and execute.  | On a new line following the code encapsulated in three back backquotes (` ``` `). |
| `{:screen: .screen}` |  The `{: screen}` element outputs `<pre class="screen">`, and when rendered in the IBM Cloud doc app, the CSS will retain the format of your code printed like a screen-shot on the page. Use this for examples where you want the user to read the code but not copy or reuse it. | On a new line following the code encapsulated in three back backquotes (` ``` `). |

**Note:** When you author your code examples, color CSS style is available for all languages. Style is not added via the attribute, but via a language definition applied to the top of the code block (```javascript). Be sure to style your codeblocks according to their respective language. IBM Cloud uses highlight.js; for a full list of supported languages, see [  https://github.com/highlightjs/highlight.js#supported-languages](https://github.com/highlightjs/highlight.js#supported-languages).


## Codeblock (`{: codeblock}`)

The `{: codeblock}` element outputs `<pre class="codeblock">`, and will add a copy button to the block of code it surrounds. Use this for basic chunks of code you want to make easy to copy and reuse. 

#### Example input

```markdown
<!-- Attribute definition --> 
{:codeblock: .codeblock}


<!-- A block of code with attribute bound to it --> 
    ```javascript
    /**
     * Hello world as an OpenWhisk action.
     */
    function main(params) {
        var name = params.name || 'World';
        return {payload:  'Hello, ' + name + '!'};
    }
    ```
    {: codeblock}
```


#### Example output

```html
<--HTML5 output-->
<pre class="codeblock"><code class="lang-javascript hljs"> <span class="hljs-comment">/**
  * Hello world as an OpenWhisk action.
  */</span>
 <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">main</span>(<span class="hljs-params">params</span>) </span>{
     <span class="hljs-keyword">var</span> name = params.name || <span class="hljs-string">'World'</span>;
     <span class="hljs-keyword">return</span> {<span class="hljs-attr">payload</span>:  <span class="hljs-string">'Hello, '</span> + name + <span class="hljs-string">'!'</span>};
 }
</code></pre>
```


## Pre (`{: pre}`)

The `{: pre}` element outputs `<pre class="pre">`, and will add a copy button to the block of code it surrounds. Additionally, `<pre class="pre">` will prepend the code example with a `$`. This is a visual indicator only, and does not copy through into the buffer when you click the copy button. Use this for commands you expect users to copy, paste, and execute.

#### Example input

```markdown
<!-- Attribute definition --> 
{:pre: .pre}

    ```
    ibmcloud fn action create hello hello.js
    ```
    {: pre}
```   

#### Example output

```html
<--HTML5 output-->
<pre class="pre"><code class="hljs"> 
ibmcloud fn action create hello hello.js
</code></pre>
```


## Screen (`{: screen}`)

The `{: screen}` element outputs `<pre class="screen">`, and will retain the format of your code printed like a screen-shot on the page. Use this for examples where you want the user to read the code but not copy or reuse it.

#### Example input

```markdown
<!-- Attribute definition --> 
{:screen: .screen}
   
    ```
    {
        "payload": "Hello, World!"
    }
    ```
    {: screen}
```   

#### Example output

```html
<--HTML5 output-->
<pre class="screen"><code class="hljs"> {
     &quot;payload&quot;: &quot;Hello, World!&quot;
 }
</code></pre>

```
