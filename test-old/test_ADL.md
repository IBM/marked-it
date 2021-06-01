{:one: #one .oneClass one='oneValue'}
{:two: #two .twoClass two='twoValue'}
{:three: #three .threeClass one='extraValue' three='threeValue'}

#no ADL

#use an ADL
{: one}

#override an ADL's id
{: one #headerId}

#add to an ADL's list of classes
{: one .headerClass1 .headerClass2}

#override an ADL's key value
{: one one='altValue'} 

#use two ADLs, ids will conflict
{: one two}

#use two ADLs, ids and key values will conflict
{: one three}
