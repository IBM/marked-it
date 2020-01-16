# Quick and dirty script to build the search index automatically
# Expects to be run in the <playbook-root>/assets/scripts directory
# Will create the search content .js file in the same directory
# You need to replace the one in the <playbook-root>/assets/tipuesearch directory
# 
# not much error checking
# your mileage may vary

import os
import re
with open("tipuesearch_content.js", "w") as output_file:
    print("var tipuesearch = {", file=output_file)
    print('  "pages": [', file=output_file)

    for dirpath, dirs, files in os.walk("../../_content"):
        for filename in os.listdir(dirpath):
            if filename.endswith(".md"): 
                url = (dirpath + "/" + filename).replace("../../_content/","https://pages.github.ibm.com/the-playbook/").replace(".md","/")
                
                with open(dirpath + "/" + filename, 'r') as myfile:
                    current_file_text = myfile.read().replace('\n', '')
                    current_file_text = re.sub('<[^<]+?>', '', current_file_text)
                    current_file_text = re.sub('"','', current_file_text)
                    current_file_text = re.sub("'", '', current_file_text)
                    current_file_text = re.sub(r"\*", '', current_file_text)                                        
                    my_title = ""
                    if "weight: " in current_file_text:
                        my_title = current_file_text.split("weight: ")[0]
                    else:
                        try:
                            my_title = current_file_text.split("---", 2)[1]
                        except:
                            my_title = ""
                    try:
                        my_title = my_title.split("title: ")[1]
                    except:
                        my_title = ""
                    
                    print("    {", file=output_file)
                    print('      "title": "' + my_title + '",', file=output_file)
                    print('      "text": "' + current_file_text + '",', file=output_file)
                    print('      "tags": "'  + '",', file=output_file)
                    print('      "url": "' + url + '",', file=output_file)
                    print("    },", file=output_file)

    print("  ]\n};", file=output_file)
