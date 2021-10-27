# Key references

A key reference, also known as a keyref, is a way to define a value once and reference it throughout your set of documents.

## How to add a new key reference
 
1. You have a new product called "Amazing Thing", and you plan to refer to it in multiple locations across multiple files.
2. Navigate to the directory that contains your `keyrefs.yml` file and open it with an editor that supports YAML.

  > **Note**: This parser that transforms Markdown to HTML5 restricts the use of key definitions to one keyref source file. 

3. YAML allows you to nest multiple values (where each value contains the text you want to store as your content reference) under each key that you create. For example: 
 
   ```yaml
   # Comments in YAML use the pound symbol
   root_key:
    key1:
      keyref value 1
    key2:
      keyref value 2
   ```
 
   > **Note**: Each key and value combination must be unique. 
 
4. Add your new product "Amazing Thing" to `keyrefs.yml`:
 
   ```yaml
   keyword:
     amazing_thing:
       Amazing Thing
    ```
 
5. Now you can reference this keyref from anywhere in your Markdown topics. Keyrefs are referenced using syntax: {\{site.data.key+}}. So to reference your new keyref, you would use: {\{site.data.keyword.amazing_thing}}.
 
6. Run mdProcessor on your file, ensuring that you use the `--keyref-file` flag:
 
   ```bash
   node bin/marked-it-cli C:\pilot\sourceMD --output=C:\pilot\outputMD --header-file=header.txt --footer-file=footer.txt --keyref-file=keyrefs.yml --overwrite
   ``` 
 
7. The HTML5 output will contain the string "Amazing Thing" in each location that the source Markdown contains {\{site.data.keyword.amazing_thing}}.

## How does marked-it process keyrefs?
The keyref extension is invoked by the generator by using the keyref-file flag: `--keyref-file=keyrefs.yml`. 
 
 >node mdProcessor.js --sourceDir=C:\pilot\sourceMD --destDir=C:\pilot\outputMD --headerFile=header.txt --footerFile=footer.txt 
 >**--keyref-file=keyrefs.yml** -overwrite
 
Keyrefs are stored in a yaml file, for example `keyrefs.yml`. The keyrefs YAML file can be placed in any directory as specified in the `--keyref-file` parameter. 

Keyref definitions in YAML are structured in nested keys, each key that contains a value or a subkey must be followed by a colon (:), and the next line must be indented 2 space. For example:

```yaml
key:
  subkey1:
    keyref value 1
  subkey2:
    keyref value 2  
```

Keyrefs in Markdown are called by using the following syntax: {\{site.data.key1.key2...keyN}}

## Example input and output

Example of keyrefs called from Markdown (stored in keyrefs.yml):

```markdown
 This is a new paragraph all about using keyrefs. This following syntax {{site.data.keyword.cloud}} is actually a keyref! I can use {{site.data.keyword.cloud}} multiple times in a paragraph. 
 * I can use the full product name: {{site.data.keyword.cloud}}
 * Or I can use the shortened product name: {{site.data.keyword.cloud_short}}
 * {{site.data.keyword.activedeploy}} is a service. 
 * So is {{site.data.keyword.ama}}
```	


Example HTML output of a keyref being called from a YAML file:
 
```html
<p>This is a new paragraph all about using keyrefs. This word here: IBM Cloud™ is actually a keyref! I can use IBM Cloud™ multiple times in a paragraph.</p>
<ul>
<li>I can use the full product name: IBM Cloud™</li>
<li>Or I can use the shortened product name: Cloud</li>
<li>Active Deploy is a service.</li>
<li>So is Advanced Mobile Access</li>	
</ul>	
```
