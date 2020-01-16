---
title: Content references
---

A content reference, also known as a conref, is a way to define a value once and reference it throughout your set of documents.

## How to add a new content reference
 
1. You have a new product called "Amazing Thing", and you plan to refer to it in multiple locations across multiple files.
2. Navigate to the `/MarkdownProcessor` directory that contains `mdProcessor.js` and open `conrefs.yml` with an editor that supports YAML (Notepad++, for example).

   **Note**: The parser that transforms Markdown to HTML5 restricts the use of conrefs to one conref source file. 

3. YAML allows you to nest multiple values (where each value contains the text you want to store as your content reference) under each key that you create. For example: 
 
   ```yaml
   # Comments in YAML use the pound symbol
   root_key:
    key1:
      conref value 1
    key2:
      conref value 2
   ```
 
    **Note**: Each key and value combination must be unique. 
 
4. Add your new product "Amazing Thing" to `conrefs.yml`:
 
   ```yaml
   keyword:
     amazing_thing:
       Amazing Thing
    ```
 
5. Now you can reference this conref from anywhere in your Markdown topics. Conrefs are referenced using syntax: {\{site.data.key+}}. So to reference your new conref, you would use: {\{site.data.keyword.amazing_thing}}.
 
6. Run mdProcessor on your file, ensuring that you use the --conrefFile flag:
 
   ```bash
   node mdProcessor.js --sourceDir=C:\pilot\sourceMD --destDir=C:\pilot\outputMD --headerFile=header.txt --footerFile=footer.txt --conrefFile=conref.yml -overwrite
   ``` 
 
7. The HTML5 output will contain the string "Amazing Thing" in each location that the source Markdown contains {\{site.data.keyword.amazing_thing}}.

## How does marked-it process conrefs?
The conref extension is invoked by the generator by using the conrefFile flag: `--conrefFile=conrefs.yml`. 
 
 >node mdProcessor.js --sourceDir=C:\pilot\sourceMD --destDir=C:\pilot\outputMD --headerFile=header.txt --footerFile=footer.txt 
 >**--conrefFile=conrefs.yml** -overwrite
 
Conrefs are stored in a yaml file, for example `conrefs.yml`. The conrefs YAML file can be placed in any directory as specified in the `--conrefFile` parameter. 

Conref definitions in YAML are structured in nested keys, each key that contains a value or a subkey must be followed by a colon (:), and the next line must be indented 2 space. For example:

```yaml
key:
  subkey1:
    conref value 1
  subkey2:
    conref value 2  
```

Conrefs in Markdown are called by using the following syntax: {\{site.data.key1.key2...keyN}}

**Note:** While you can nest keys as deep as you like in YAML, and call deeper sets of keys from Markdown, IBM Cloud conrefs use only 2 keys. For example: {\{site.data.keyword.cloud}}  

## Content references in DITA vs Markdown

In DITA, a content reference, or conref, is a way of reusing or pulling content from one file into another file; effectively making a copy during the transform. 
 
Example of conrefs sourced in DITA (stored in conrefs.dita):

```html
<!--//Do not translate - Begin-->
<p><keyword id="cloud"><tm tmtype="tm" trademark="cloud">IBM Cloud</tm></keyword></p>
```

Example HTML output of a conref being called from a DITA file:
 
```html
<p>This Ruby starter application is a boilerplate for <keyword conref="conrefs.dita#conrefs/cloud">IBM Cloud</keyword> Ruby web application development.</p>	
```
 
Example of conrefs called from Markdown (stored in conrefs.yml):
{% raw %}
```markdown
 This is a new paragraph all about using conrefs. This following syntax {{site.data.keyword.cloud}} is actually a conref! I can use {{site.data.keyword.cloud}} multiple times in a paragraph. 
 * I can use the full product name: {{site.data.keyword.cloud}}
 * Or I can use the shortened product name: {{site.data.keyword.cloud_short}}
 * {{site.data.keyword.activedeploy}} is a service. 
 * So is {{site.data.keyword.ama}}
```
{% endraw %}	


Example HTML output of a conref being called from a YAML file:
 
```html
<p>This is a new paragraph all about using conrefs. This word here: IBM Cloud™ is actually a conref! I can use IBM Cloud™ multiple times in a paragraph.</p>
<ul>
<li>I can use the full product name: IBM Cloud™</li>
<li>Or I can use the shortened product name: Cloud</li>
<li>Active Deploy is a service.</li>
<li>So is Advanced Mobile Access</li>	
</ul>	
```
