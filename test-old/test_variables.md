{:one: #{{site.data.product.bluemix }} .oneClass one='oneValue'}

#Just the variable, a few times
{{site.data.product.bluemix   }}
{{   site.data.product.bluemix}}
{{   site.data.product.bluemix   }}

#An unknown variable
{{ site.data.bogus }}

#A variable that does not start with site.data
{{site.asdf.product.bluemix }}

#A variable whose value is another variable, which resolves to the value of site.data.product.bluemix
{{site.data.var.name}}

#A variable in an IAL
{: one}

some last text, make sure it goes through
