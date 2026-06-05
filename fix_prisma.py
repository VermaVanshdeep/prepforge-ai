import os
import re

directories = ['app', 'actions', 'components', 'lib', 'prisma']
pattern = re.compile(r'prisma\.([a-zA-Z0-9_]+)\.(findMany|findUnique|findFirst|create|update|upsert|delete|count)\(')

for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_content = pattern.sub(r'prisma.\1?.\2(', content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
