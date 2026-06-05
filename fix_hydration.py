import os
import re

files_to_check = [
    "actions/admin.ts",
    "components/interview/InterviewSetupForm.tsx",
    "components/dashboard/AnalyticsView.tsx",
    "components/profile/ProfileView.tsx",
    "components/reports/ReportsView.tsx",
    "app/dashboard/page.tsx",
    "app/admin/page.tsx",
    "components/Footer.tsx"
]

for filepath in files_to_check:
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace .toLocaleDateString() with .toLocaleDateString("en-US")
    content = content.replace('.toLocaleDateString()', '.toLocaleDateString("en-US")')
    
    # Replace .toLocaleString() with .toLocaleString("en-US")
    content = content.replace('.toLocaleString()', '.toLocaleString("en-US")')
    
    # Replace .toLocaleDateString(undefined, with .toLocaleDateString("en-US",
    content = content.replace('.toLocaleDateString(undefined,', '.toLocaleDateString("en-US",')
    
    # Fix Footer.tsx currentYear
    if filepath == "components/Footer.tsx":
        content = content.replace('const currentYear = new Date().getFullYear();', 'const currentYear = 2026;')

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")
