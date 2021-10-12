# Definition lists

A definition list is used to list terms and one or more associated definitions. 

In marked-it 2.0, you can specify a definition list term, and on the next line you specify a definition with `:` followed by 3 spaces and then the definition text. To add another term to the list, insert a blank line, and then another term-definition pair.

> **Tip:** Anywhere from 1-4 spaces is supported. But, our examples will always use 3 spaces.

As with other types of lists, you can embed paragraphs, sublists, and code blocks within the definitions as needed, and you can specify anchors to terms or definitions. You can also nest definition lists within other types of lists, such as ordered and unordered lists.


## Example usage

In the following example, `Orange` is a term with two separate definitions, and `Banana` is a term with one definition that contains an embedded list, paragraph, and code block. An ID is also applied to the `Banana` term so that it can be linked to from elsewhere in the documentation.

```markdown
Orange
:   The fruit of an evergreen tree of the genus Citrus.
:   A color between red and yellow on the rainbow.

Banana {: #banana-facts}
:   Starchy long fruits. Technically an herb? They are:

    - Long 
    - Kinda beige
    - Varying degrees of squishy

    Also, they have a `yellow` peel. Share your love for bananas from the command line:

    ```sh
    echo "I like bananas!"
    ```
    {: pre}
```
