# Syntax highlighting

It's best practice to add syntax highlighting to your codeblocks to make them easier to visually parse. In marked-it, syntax highlighting is provided by the highlight.js project. Highlight.js adds language-specific highlighting to codeblocks and supports a large variety of languages. For a complete list, see [Supported languages](https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md) in the highlight.js GitHub repo. 

> **Note:** Syntax highlighting can be applied only to block-level code examples and can't be applied to code phrases within a paragraph.

To highlight your code snippets, you can add a language tag after a line of three backticks. For example, if I'm giving a `curl` command example, I would have the three backticks and then append `sh` to the end, which would look like this: \`\`\`sh. The highlighted code block would look similar to the following: 

```sh
curl -X PUT "https://<region>.appid.cloud.ibm.com/management/v4/<tenant_ID>/applications/<client_ID>/scopes" -H "accept: application/json" -H "Content-Type: application/json" -d "{\ "scopes":\ [\ <scopes_object>" ]}"
```

Similarly, for a Python example I can use the same approach and add `python` after the opening three backticks to apply syntax highlighting.

```python
# Python example

message = 'Hello, world!'

print(message)
```
