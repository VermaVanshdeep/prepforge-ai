import os
filepath = "lib/gemini.ts"
with open(filepath, 'r') as f:
    content = f.read()
content = content.replace('gemini-1.5-flash', 'gemini-2.5-flash')
with open(filepath, 'w') as f:
    f.write(content)
