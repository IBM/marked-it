# Content key references

A content key reference, also known as a conkeyref, is a way to define a value once and reference it throughout your set of documents.

## How to add a new content key reference
 
1. You have a new product called "Amazing Thing", and you plan to refer to it in multiple locations across multiple files.
2. Navigate to the directory that contains your `conkeyrefs.yml` file and open it with an editor that supports YAML.

  > **Note**: The parser that transforms Markdown to HTML5 restricts the use of conkeyrefs to one conkeyref source file. 

3. YAML allows you to nest multiple values (where each value contains the text you want to store as your content reference) under each key that you create. For example: 
 
   ```yaml
   # Comments in YAML use the pound symbol
   root_key:
    key1:
      conkeyref value 1
    key2:
      conkeyref value 2
   ```
 
   > **Note**: Each key and value combination must be unique. 
 
4. Add your new product "Amazing Thing" to `conkeyrefs.yml`:
 
   ```yaml
   keyword:
     amazing_thing:
       Amazing Thing
    ```
 
5. Now you can reference this conkeyref from anywhere in your Markdown topics. Conkeyrefs are referenced using syntax: {\{site.data.key+}}. So to reference your new conkeyref, you would use: {\{site.data.keyword.amazing_thing}}.
 
6. Run mdProcessor on your file, ensuring that you use the --conkeyrefFile flag:
 
   ```bash
   node bin/marked-it-cli C:\pilot\sourceMD --output=C:\pilot\outputMD --header-file=header.txt --footer-file=footer.txt --conkeyref-file=conkeyrefs.yml --overwrite
   ``` 
 
7. The HTML5 output will contain the string "Amazing Thing" in each location that the source Markdown contains {\{site.data.keyword.amazing_thing}}.

## How does marked-it process conkeyrefs?
The conkeyref extension is invoked by the generator by using the conkeyrefFile flag: `--conkeyref-file=conkeyrefs.yml`. 
 
 >node mdProcessor.js --sourceDir=C:\pilot\sourceMD --destDir=C:\pilot\outputMD --headerFile=header.txt --footerFile=footer.txt 
 >**--conkeyref-file=conkeyrefs.yml** -overwrite
 
Conkeyrefs are stored in a yaml file, for example `conkeyrefs.yml`. The conkeyrefs YAML file can be placed in any directory as specified in the `--conkeyref-file` parameter. 

Conkeyref definitions in YAML are structured in nested keys, each key that contains a value or a subkey must be followed by a colon (:), and the next line must be indented 2 space. For example:

```yaml
key:
  subkey1:
    conkeyref value 1
  subkey2:
    conkeyref value 2  
```

Conkeyrefs in Markdown are called by using the following syntax: {\{site.data.key1.key2...keyN}}

## Example input and output

Example of conkeyrefs called from Markdown (stored in conkeyrefs.yml):

```markdown
 This is a new paragraph all about using conkeyrefs. This following syntax {{site.data.keyword.cloud}} is actually a conkeyref! I can use {{site.data.keyword.cloud}} multiple times in a paragraph. 
 * I can use the full product name: {{site.data.keyword.cloud}}
 * Or I can use the shortened product name: {{site.data.keyword.cloud_short}}
 * {{site.data.keyword.activedeploy}} is a service. 
 * So is {{site.data.keyword.ama}}
```	


Example HTML output of a conkeyref being called from a YAML file:
 
```html
<p>This is a new paragraph all about using conkeyrefs. This word here: IBM Cloud™ is actually a conkeyref! I can use IBM Cloud™ multiple times in a paragraph.</p>
<ul>
<li>I can use the full product name: IBM Cloud™</li>
<li>Or I can use the shortened product name: Cloud</li>
<li>Active Deploy is a service.</li>
<li>So is Advanced Mobile Access</li>	
</ul>	
```
