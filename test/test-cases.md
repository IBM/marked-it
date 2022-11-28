---

copyright:
  years: 2021, 2022
lastupdated: "2022-11-28"

---


{:shortdesc: .shortdesc}
{:row-headers: .row-headers}
{:term: .term}
{:audio: .audio}
{:video: .video}

# Test cases for marked-it changes
{: #test-for-marked-it-changes}

This would be a short description for the first topic.
{: shortdesc}

## Animated graphic
{: #animated-gif-css}

![Migration of a Cloud Foundry service instance to a resource group](images/migration.mp4){: video controls loop}

## Audio
{: #audio-css}

![en-US_KevinV3Voice sample](https://watson-developer-cloud.github.io/doc-tutorial-downloads/text-to-speech/samples-neural/KevinV3.wav){: audio controls}

![en-US_KevinV3Voice sample](https://watson-developer-cloud.github.io/doc-tutorial-downloads/text-to-speech/samples-neural/KevinV3.wav){: audio controls style="width:250px;height:30px"}

## Code highlighting testing

The doc app uses highlight.js to add coloring to each of the code example snippets. The highlight.js supports a wide range of languages, as long as we have the right class name of language on the element. You can refer to their demo page at: https://highlightjs.org/static/demo/. We are using a custom theme based on Carbon-approved colors.

This feature is now part of Markdown source only. The highlighting "tagging" is now being added during the parser transforms to HTML 5.

If no language is indicated, default syntax highlighting should show...but might not be consistent across snippets. The list of supported values can be found here: https://github.com/highlightjs/highlight.js/blob/master/SUPPORTED_LANGUAGES.md

To define a specific language class to a code snippet, add the defined language value immediately following the opening three ticks (```) of the code snippet.

Examples for testing the most popular languages follow.


### C++
```c++
#include <iostream>

int main(int argc, char *argv[]) {

  /* An annoying "Hello World" example */
  for (auto i = 0; i < 0xFFFF; i++)
    cout << "Hello, World!" << endl;

  char c = '\n';
  unordered_map <string, vector<string> > m;
  m["key"] = "\\\\"; // this is an error

  return -2e3 + 12l;
}
```

### Go
```go
type Interface interface {
            Len() int
            Less(i, j int) bool
            Swap(i, j int)
    }

    func Sort(data Interface) {
            ...
    }
```

### Java

```java
Connection con = null;
try {
   Class.forName("com.ibm.db2.jcc.DB2Driver");
   String jdbcurl =  (String) bludb.get("jdbcurl"); // use ssljdbcurl to connect via SSL
   String user = (String) bludb.get("username");
   String password = (String) bludb.get("password");
   con = DriverManager.getConnection(jdbcurl, user,password);
   con.setAutoCommit(false);
} catch (SQLException e) {
   writer.println("SQL Exception: " + e);
   return;
} catch (ClassNotFoundException e) {
   writer.println("ClassNotFound Exception: " + e);
   return;
}
Statement stmt = null;
String sqlStatement = "";
try {
   stmt = con.createStatement();
   sqlStatement = "SELECT TABNAME,TABSCHEMA FROM SYSCAT.TABLES FETCH FIRST 10 ROWS ONLY";
   ResultSet rs = stmt.executeQuery(sqlStatement);
} catch (SQLException e) {
   writer.println("Error creating statement: " + e);
}
```

### Node (JavaScript)
```javascript
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
...
var db2;

var env = JSON.parse(process.env.VCAP_SERVICES);
db2 = env['dashDB'][0].credentials;

var connString = "DRIVER={DB2};DATABASE=" + db2.db + ";UID=" + db2.username + ";PWD=" + db2.password + ";HOSTNAME=" + db2.hostname + ";port=" + db2.port;

app.get('/', routes.listSysTables(ibmdb,connString));
```

### PHP
```php
// Parse VCAP
if( getenv("VCAP_SERVICES") ) {
    $json = getenv("VCAP_SERVICES");
}
// No DB credentials
else {
    throw new Exception("No Database Information Available.", 1);
}

// Decode JSON and gather DB Info
$services_json = json_decode($json,true);
$bludb_config = $services_json["dashDB"][0]["credentials"];

// Create DB connect string
$conn_string = "DRIVER={IBM DB2 ODBC DRIVER};DATABASE=".
   $bludb_config["db"].
   ";HOSTNAME=".
   $bludb_config["host"].
   ";PORT=".
   $bludb_config["port"].
   ";PROTOCOL=TCPIP;UID=".
   $bludb_config["username"].
   ";PWD=".
   $bludb_config["password"].
   ";";
```

### Python
```python
import json
vcap_services = json.loads(os.environ['VCAP_SERVICES'])
service = vcap_services['dashDB'][0]
credentials = service["credentials"]
url = 'DATABASE=%s;uid=%s;pwd=%s;hostname=%s;port=%s;' % ( credentials["db"],credentials["username"],credentials["password"],credentials["host"],credentials["port"])
```


### Ruby
```ruby
if conn = IBM_DB.connect(dsn, '', '')
    sql = "SELECT FIRST_NAME, LAST_NAME from GOSALESHR.employee FETCH FIRST 10 ROWS ONLY"
    if stmt = IBM_DB.exec(conn, sql)
       total = total + sql + "<BR><BR>\n"
    else
      out = "Statement execution failed: #{IBM_DB.stmt_errormsg}"
      total = total + out + "<BR>\n"
    end
  end
```

### SQL
```sql
CREATE TABLE "topic" (
    "id" serial NOT NULL PRIMARY KEY,
    "forum_id" integer NOT NULL,
    "subject" varchar(255) NOT NULL
);
ALTER TABLE "topic"
ADD CONSTRAINT forum_id FOREIGN KEY ("forum_id")
REFERENCES "forum" ("id");

-- Initials
insert into "topic" ("forum_id", "subject")
values (2, 'D''artagnian');
```

### Swift
```swift
import Kitura

let router = Router()
router.get("/") {
     request, response, next in
     response.send("Hello, Server Side Swift")
     next()
}
Kitura.addHTTPServer(onPort: 8090, with: router)
Kitura.run()
```

### YAML

```yaml
---
# comment
string_1: "Bar"
string_2: 'bar'
string_3: bar
inline_keys_ignored: sompath/name/file.jpg
keywords_in_yaml:
  - true
  - false
  - TRUE
  - FALSE
  - 21
  - 21.0
  - !!str 123
"quoted_key": &foobar
  bar: foo
  foo:
  "foo": bar

reference: *foobar

multiline_1: |
  Multiline
  String
multiline_2: >
  Multiline
  String
multiline_3: "
  Multiline string
  "

ansible_variables: "foo {{variable}}"

array_nested:
- a
- b: 1
  c: 2
- b
- comment
```

### Bash

```bash
#!/bin/bash

###### CONFIG
ACCEPTED_HOSTS="/root/.hag_accepted.conf"
BE_VERBOSE=false

if [ "$UID" -ne 0 ]
then
 echo "Superuser rights required"
 exit 2
fi

genApacheConf(){
 echo -e "# Host ${HOME_DIR}$1/$2 :"
}

echo '"quoted"' | tr -d \" > text.txt
```

```sh
#!/bin/bash

###### CONFIG
ACCEPTED_HOSTS="/root/.hag_accepted.conf"
BE_VERBOSE=false

if [ "$UID" -ne 0 ]
then
 echo "Superuser rights required"
 exit 2
fi

genApacheConf(){
 echo -e "# Host ${HOME_DIR}$1/$2 :"
}

echo '"quoted"' | tr -d \" > text.txt
```

### Shell

```shell
$ echo $EDITOR
```

```shell
$ curl -X POST \
"https://anvil.cloud.ibm.com/v1/anvils \
-H "Authorization: Bearer <IAM_Token>" \
-H 'Content-Type: application/json' \
-d '{
  "source_account_id": "a1b2c32a5ea94809a9840f5e23c362d",
  "name": "Sample Anvil",
  "domain": "example.com",
  "primary_contact_iam_id": "IBMid-0123ABC"
}'
```

```shell
$ docker run \
      --publish=7474:7474 --publish=7687:7687 \
      --volume=/neo4j/data:/data \
      --volume=/neo4j/plugins:/plugins \
      --volume=/neo4j/conf:/conf \
      --volume=/logs/neo4j:/logs \
      --user="$(id -u neo4j):$(id -g neo4j)" \
      --group-add=$groups \
      neo4j:3.4
```

## Code styling testing

```
This is a block of code
```

`This is a code phrase`

## Definition list
{: #definition-list-test}

Apple {: #test-def-anchor1}
:   Pomaceous fruit of plants of the genus Malus in 
    the family Rosaceae.
:   An American computer company.

Orange
:   The fruit of an evergreen tree of the genus Citrus. {: #test-def-anchor1} 

    You can peel it and eat it and enjoy it.

Banana
:   Starchy long fruits. Technically an herb? They are:

    - Long {: #banana-facts}
    - Kinda beige
    - Varying degrees of squishy

    Also, they have a `yellow` peel. Share your love for bananas from the command line:

    ```sh
    echo "I like bananas!
    ```
    
Prune
:   High fiber, questionably tasty dried plum.

## Footnotes
{: #footnotes-test}

When a `PUT` request is successfully and synchronously used to replace an existing resource, a status of `200`[^200] OK MUST be returned. 

[^200]: [RFC 2616](https://tools.ietf.org/html/rfc2616#section-9.6){: external} requires that a successful resource update by a PUT request return either a `200` OK status or a `204` No Content status. Since this handbook requires that a successful PUT request of any kind return the resource as represented by a GET request to the same URI, only a `200` OK status is appropriate in this case.

Simple table:

|                                         | Lite               | Pay-As-You-Go      |
|-----------------------------------------|--------------------|--------------------|
| **Free Cloud Foundry memory [^tabletext]** | 256 MB            |             |              |
| **Free community buildpacks [^tabletext2]** | 186 GBH             |   186 GBH       |
| **Access to Lite service plans** | ![Feature available](../icons/icon_enabled.svg) | ![Feature available](../icons/icon_enabled.svg) |
| **Access to all free plans**            |                    | ![Feature available](../icons/icon_enabled.svg) |
{: caption="Table 1. Account features" caption-side="bottom"}

[^tabletext]: Not available for Lite accounts created after 12 August 2021.  

[^tabletext2]: Not available for Lite accounts created after 12 August 2021.

Comparison table:

| Service | Dallas 01 | Dallas 05 | Dallas 06 |
|-----|-----|-----|-----|
| Bare Metal Server | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) |
| Block Storage | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg)[^comparison-icon] |
| Citrix NetScaler[^comparison-text] VPX | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) |
{: row-headers}
{: class="comparison-table"}
{: caption="Table comparison. Americas infrastructure availability" caption-side="bottom"}
{: summary="This table has row and column headers. The row headers identify the service. The column headers identify where that service is located. To understand where a service is located in the table, navigate to the row, and find the for the location you are interested in."}

[^comparison-text]: Text in a comparison table

[^comparison-icon]: Icon in a comparison table

Ordered list:

1. This is the first item, and `this phrase` should be highlighted.[^li1]
   1. This is a nested item and surrounded by bold **`this is another phrase`** that should be highlighted and **bold**.
   2. This is a second nested item surrounded by italics and *`this is yet another phrase`* that should be highlighted and *italicized*.[^li2]
2. This is the second[^li3] item and `I get highlighted`.

Unordered list:

- bullet `1`[^li4]
   - sub-bullet **`1.1 bold`**
   - sub-bullet *`1.2 highlight`*[^li5]
- bullet `2`


[^li1]: Step 1

[^li2]: Substep 2

[^li3]: Fourth word in step 2

[^li4]: Bullet 1

[^li5]: Sub-bullet 1.2

## Headings test
{: #headings}

### H3 Heading
{: #headings-h3}

Test for H3 heading.

#### H4 Heading
{: #headings-h4}

Test for H4 heading.

##### H5 Heading
{: #headings-h5}

Test for H5 heading.

###### H6 Heading
{: #headings-h6}

Test for H6 heading.

## Image wrapped in figure tag

By adding a caption to the image (attribute must be on the same line), you can wrap the image in a figure tag and produce a clean caption inside the `figcaption` tag. This will allow for better image figure captions with consistent wrapping in the doc app.

The markdown source caption attribute must be on the same line as the image, directly follwing the closing parentheses of the image link. Additionally, you must specify `caption-side="bottom"` to ensure that `marked-it-cli` will print the `figcaption` tag below the `img` tag.
{: important}

![End to end build](build/images/toc-metadata.png){: caption="Figure 1. A surprisingly tart visual that explains each Table of Contents metadata value." caption-side="bottom"}

## Inline tagging styling testing

The **cmdname** should output as bold inline text.

The *varname* should output as italized inline text.

The `option` should output as monospaced inline text.

The following demonstrates a parameter list. It should contain a bold title with a description on the following line:
  **title 1**
  definition 1

  **title 2**
  definition 2

  **title 3**
  definition

The **uicontrol** should output as bold inline text.

The `apiname` should output as monospaced inline text.

The `filepath` should output as monospaced inline text.

### Inline `code` styling

Validating the use of backticks to highlight a string of code inline rather than in block in different elements:

#### Nesting bold and italics

We want to be able to nest bold values or italic values within a code phrase that has been highlighted within `<code>`:


This should have bold around the world **tenemos** in this code phrase: `nostros **tenemos** mas influencia`.


This should have bold around the world _tenemos_ in this code phrase: `nostros _tenemos_ mas influencia`.

#### Block elements

This is a paragraph and `this should be higlighted` within that paragraph. This next line has a phrase that is highlighted and bold:  **`this is code surrounded by bold`**, `**this is bold surrounded by code**`. This next line has italics and code highlights: *`this is code surrounded by italics`*, and  `*this is italics surrounded by code*`. 

This next line has links with code. This is a link [Cloud is amazing](www.cloud.ibm.com). This is a link surrounded by code highlights: `[Cloud is amazing](www.cloud.ibm.com)`. Bold code link: **`[Cloud is amazing](www.cloud.ibm.com)`**. Italics code link: *`[Cloud is amazing](www.cloud.ibm.com)`*.

#### List elements

Ordered List:

1. This is the first item, and `this phrase` should be highlighted.
   1. This is a nested item and surrounded by bold **`this is another phrase`** that should be highlighted and **bold**.
   2. This is a second nested item surrounded by italics and *`this is yet another phrase`* that should be highlighted and *italicized*.
2. This is the second item and `I get highlighted`.
3. This is a third item with a code block.

   ```python
   # Python example
   message = 'Hello, world!'
   
   print(message)
   ```
   
4. This is a fourth item.

Unordered List: 

- bullet `1`
   - sub-bullet **`1.1 bold`**
   - sub-bullet *`1.2 highlight`*
- bullet `2`
- bullet `3`
   
   ```python
   # Python example
   message = 'Hello, world!'
   
   print(message)
   ```
   
Another example:

1. Check the VLANs that are available in your cluster.

   ```sh
   cluster get --cluster <cluster_name_or_ID> --show-resources
   ```
   
   Example output:

   ```text
   VLAN ID   Subnet CIDR         Public   User-managed
   229xxxx   169.xx.xxx.xxx/29   true     false
   229xxxx   10.xxx.xx.x/29      false    false
   ```

1. This is another list item.
1. Also so is this.

## Link testing

### Anchor links

- [Link to strong1](#strong1)
- [Link to strong2](#strong2)
- [Link to emphasized1](#emphasized1)
- [Link to emphasized2](#emphasized2)
- [Link to codeblock-anchor](#codeblock-anchor)
- [Link to codespan](#codedspan)
- [Link to link](#link1)
- [Link to paragraph1](#paragraph1)
- [Link to ordered list item](#anchor-list-item1)
- [Link to ordered list](#ordered-list1)
- [Link to unordered list item](#anchor-list-item2)
- [Link to unordered list](#unordered-list1)
- [Link to table](#table-anchor)

This paragraph contains **strong text with anchor 1**{: #strong1} and __strong text with anchor 2__{: #strong2}.  It also contains *emphasized text with anchor 1*{: #emphasized1} and _emphasized text with anchor 2_{: #emphasized2}.

```
This is a code block with an anchor.
```
{: #codeblock-anchor}

This paragraph contains a `code span with anchor`{: #codespan}, a [link to github](https://www.github.com){: #link1}
{: #paragraph1}

1. An ordered list item with a ~~strikethrough~~ {:#anchor-list-item1}
1. Another ordered list items.
1. Another ordered list item.
{: #ordered-list}

- an unordered list item {: #anchor-list-item2}
- an unordered list item with an ![image]("./non-existent-image.png" "a title"){: #image1}
- another unordered list item
{: #unordered-list}


| Header 1 | Header 2 |
|----------|----------|
| Column 1 | Column 2 |
{: #table-anchor}

## Lists

### Ordered lists

1. This is a list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
1. This is a list item.
    - This is a nested unordered list item.
    - This is a nested unordered list item.
    - This is a nested unordered list item.
1. This is a list item.

   This is a paragraph under a list item.

1. This is a list item.

   ```sh
   code block
   ```
   
1. This is a list item.

### Unordered lists

This is a list that uses `-`.

- This is a list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
- This is a list item.
    - This is a nested unordered list item.
    - This is a nested unordered list item.
    - This is a nested unordered list item.
- This is a list item.

   This is a paragraph under a list item.

- This is a list item.

   ```sh
   code block
   ```
      
- This is a list item.

This is a list that uses `*`.

* This is a list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
    1. This is a nested ordered list item.
* This is a list item.
    * This is a nested unordered list item.
    * This is a nested unordered list item.
    * This is a nested unordered list item.
* This is a list item.

   This is a paragraph under a list item.

* This is a list item.

   ```sh
   code block
   ```
      
* This is a list item.

### Attribute on list item
{: #mi-20-list-item-attributes}

1. This is a list item.
1. This is a list item with an anchor.{: #yay-list-item-anchors}
1. This is a list item _with an anchor and no space_{: #i-like-list-items}
1. This is a list item _with an anchor_ {: #i-like-list-items}
1. This is a list item with an [external link](https://cloud.ibm.com){: external}
1. This is a list item with an [external link](https://cloud.ibm.com){: python}
1. This is a list item with an [external link](https://cloud.ibm.com) {: python}
1. This is a list item with an [external link](https://cloud.ibm.com){: external}{: python}
1. This is a list item with an [external link](https://cloud.ibm.com){: external} {: python}
1. This is a list item with an [external link](https://cloud.ibm.com){: external}. {: python}

## Quotations

"This is a quote with quotation marks."

<q>This is a quote using HTML q tags.</q>

## Superscript

This is a test to see if subscript works...

19^th^

## Subscript

This is a test to see if superscript works...

H~2~O

## Tables

### Comparison table
{: #comparison-table-test}

| Service | Dallas 01 | Dallas 05 | Dallas 06 |
|-----|-----|-----|-----|
| Bare Metal Server | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) |
| Block Storage | ![Checkmark icon](../icons/checkmark-icon.svg) | | ![Checkmark icon](../icons/checkmark-icon.svg) |
| Citrix NetScaler VPX | ![Checkmark icon](../icons/checkmark-icon.svg) | ![Checkmark icon](../icons/checkmark-icon.svg) |  |
{: row-headers}
{: class="comparison-table"}
{: caption="Table comparison. Americas infrastructure availability" caption-side="bottom"}
{: summary="This table has row and column headers. The row headers identify the service. The column headers identify where that service is located. To understand where a service is located in the table, navigate to the row, and find the for the location you are interested in."}

### Complex table
{: #complex-table-test}

|                    | One or all IAM-enabled services                                                      | Selected service in a resource group                | Resource group access |
|--------------------|--------------------------------------------------------------------------------------|-----------------------------------------------------|-------------------------|
| Viewer role        | View instances, aliases, bindings, and credentials                                   | View only specified instances in the resource group | View resource group     |
| Operator role      |  View instances and manage aliases, bindings, and credentials                        |  Not applicable                                     | Not applicable          |
| Editor role        |  Create, delete, edit, and view instances. Manage aliases, bindings, and credentials | Create, delete, edit, suspend, resume, view, and bind only specified instances in the resource group | View and edit name of resource group |
| Administrator role |  All management actions for services                                                 | All management actions for the specified instances in the resource group | View, edit, and manage access for the resource group |
{: row-headers}
{: caption="Table 1. Example platform management roles and actions for services in an account" caption-side="bottom"}
{: summary="The first row of the table describes separate options that you can choose from when creating a policy, and the first column describes the selected roles for the policy. The remaining cells map to the selected role from the first column, and to the selected policy from the first row to describe how the roles apply in each context."}
{: #platformrolestable1}

### Simple table
{: #simple-table-test}


| Action | Required Role |
|----------|---------|
| Create a policy in an account for all services and instances | Account owner or administrator on all account management services and all Identity and Access enabled services |
| Create a policy on a service in an account | Account owner, administrator on all Identity and Access enabled services, or administrator on the service in the account |
| Create a policy on a service instance | Account owner, administrator on all Identity and Access enabled services, administrator on the service in the account, administrator on all services in the relevant resource group, or administrator on the service instance |
{: caption="Table 1. Users allowed to create access policies" caption-side="bottom"}

### New lines, paragraphs, and lists in tables
{: #tables-lists}

| Header | Header |
| --- | --- |
| Single line break | This is a cell with a new line.  \n `This is a separate line`. |
| Double line break | This is a cell with two new lines.  \n  \n _This is a separate line_. |
| Unordered lists (asterisks) | * This is a list item \n * **This is a list item** \n * This is a list item |
| Unordered lists (hyphens) | - This is a list item \n - This is a list item with `code <variable>` \n - This is a list item |
| Ordered lists | 1. This is a list item \n 1. _This is a list item_ \n 1. This is a list item |
| Code block | ```\nsh iks cluster get --cluster\n``` |
| Pipe in a table | &#124; or `&#124;`... Does this `|` work? |
{: caption="Table 1. A cool table for testing `markdown` code." caption-side="bottom"}
{: #my-cool-table}

### Tables in lists
{: #mi-20-lists-tables}

This is an ordered list:

1. This is a step with a simple table.

    | Header | Header |
    | --- | --- |
    | Cell | Cell |
    {: caption="Table 1. A cool table for testing" caption-side="bottom"}

1. This is another step.
1. This is step with a complex table.
   |  | One or all IAM-enabled services  | Selected service in a resource group  | Resource group access |
   |----|--------------------------------|---------------------------------------|-----------------------|
   | Viewer role        | View instances, aliases, bindings, and credentials                                   | View only specified instances in the resource group | View resource group     |
   | Operator role      |  View instances and manage aliases, bindings, and credentials                        |  Not applicable                                     | Not applicable          |
   | Editor role        |  Create, delete, edit, and view instances. Manage aliases, bindings, and credentials | Create, delete, edit, suspend, resume, view, and bind only specified instances in the resource group | View and edit name of resource group |
   | Administrator role |  All management actions for services                                                 | All management actions for the specified instances in the resource group | View, edit, and manage access for the resource group |
   {: row-headers}
   {: caption="Table 1. Example platform management roles and actions for services in an account" caption-side="bottom"}
   {: summary="The first row of the table describes separate options that you can choose from when creating a policy, and the first column describes the selected roles for the policy. The remaining cells map to the selected role from the first column, and to the selected policy from the first row to describe how the roles apply in each context."}
   {: #platformrolestable1}

This is an unordered list:

- This is a list item.

    | Header | Header |
    | --- | --- |
    | Cell | Cell |
    {: caption="Table 1. A cool table for testing" caption-side="bottom"}

- This is a list item.
- This is step with a complex table.
    |  | One or all IAM-enabled services  | Selected service in a resource group  | Resource group access |
    |----|--------------------------------|---------------------------------------|-----------------------|
    | Viewer role        | View instances, aliases, bindings, and credentials                                   | View only specified instances in the resource group | View resource  group     |
    | Operator role      |  View instances and manage aliases, bindings, and credentials                        |  Not applicable                                     | Not  applicable          |
    | Editor role        |  Create, delete, edit, and view instances. Manage aliases, bindings, and credentials | Create, delete, edit, suspend, resume, view, and bind only specified  instances in the resource group | View and edit name of resource group |
    | Administrator role |  All management actions for services                                                 | All management actions for the specified instances in the resource group  | View, edit, and manage access for the resource group |
    {: row-headers}
    {: caption="Table 1. Example platform management roles and actions for services in an account" caption-side="bottom"}
    {: summary="The first row of the table describes separate options that you can choose from when creating a policy, and the first column describes the selected roles for the policy.  The remaining cells map to the selected role from the first column, and to the selected policy from the first row to describe how the roles apply in each context."}
    {: #platformrolestable1}

## Videos
{: #videos-test}

### YouTube
{: #videos-test-youtube}

![Watson Assistant Tooling Overview](https://www.youtube.com/embed/h-u-5f8fZtc){: video output="iframe" width="640" height="390" id="youtubeplayer" data-script="none"}

### IBM MediaCenter
{: #video-test-mediacenter}

![Why IBM Cloud Paks on IBM Cloud?](https://www.kaltura.com/p/1773841/sp/177384100/embedIframeJs/uiconf_id/27941801/partner_id/1773841?iframeembed=true&entry_id=1_yy71r4iv){: video output="iframe" id="mediacenterplayer" frameborder="0" width="560" height="315" allowfullscreen webkitallowfullscreen mozAllowFullScreen}
