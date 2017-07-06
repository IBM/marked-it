/*
 * This example demonstrates the use of an extension to generate HTML Table
 * elements containing <caption> elements.
 */

var markedIt = require("marked-it-core");

var src = '| Color | RGB |\n| ----- |---------------|\n| Red   | {255,0,0}     |\n| White | {255,255,255} |\n{: caption="Table of color RGBs" caption-side="top"}\n';
var result = markedIt.generate(src, {
	extensions: {
		html: {
			onTable: function(html, data) {
				var table = data.htmlToDom(html)[0];
				var captionText = table.attribs["caption"];
				if (!captionText) {
					return; /* nothing to do */
				}

				var captionSide = table.attribs["caption-side"];
				delete table.attribs["caption"];
				delete table.attribs["caption-side"];
			
				var caption = data.htmlToDom("<caption>" + captionText + "</caption>")[0];
				if (captionSide) {
					caption.attribs["caption-side"] = captionSide;
				}

				/* the <caption> _must_ be the first child of the <table> */
				var children = data.domUtils.getChildren(table);
				data.domUtils.prepend(children[0], caption);
			
				return data.domToHtml(table);
			}
		}
	}
});

console.log(src + "========\n" + result.html.text);

/* Output:

| Color | RGB |
| ----- |---------------|
| Red   | {255,0,0}     |
| White | {255,255,255} |
{: caption="Table of color RGBs" caption-side="top"}
========
<table>
<caption caption-side="top">Table of color RGBs</caption>
<thead>
<tr>
<th>Color</th>
<th>RGB</th>
</tr>
</thead>
<tbody>
<tr>
<td>Red</td>
<td>{255,0,0}</td>
</tr>
<tr>
<td>White</td>
<td>{255,255,255}</td>
</tr>
</tbody>
</table>
*/
