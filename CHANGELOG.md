# Change Log

This project uses [semantic versioning](http://semver.org/).

**[0.10.1] 2018-08-13**  
Changes to support JSON-format TOC generation in marked-it-cli.

**[0.10.0] 2018-08-02**  
Support has been added for generating TOCs in JSON format.  To use this, specify option `tocJSON: true` when invoking `generate()`, and the JSON TOC output will be included in the result's `jsonToc` field.

There is also a new extension point, `json.toc.onTopic`, which is analagous to the existing `xml.toc.onTopic` extension point.

**[0.9.0] 2017-12-21**  
Events sent from the following extension points now include a *src* attribute that contains the original markdown source of the new element:
- html.onCode
- html.onHeading
- html.onHr
- html.onHtml
- html.onParagraph
- html.onTable


**[0.8.0] 2017-05-07**  
Initial release
