import re

input_file = '15TechPillars.html'
output_file = '15TechPillars_fixed.html'

with open(input_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove all superscript notations
html = re.sub(r'<span class="c13">[0-9]+</span>', '', html)

# Update the CSS class to use darker green
html = re.sub(r'\.bold-green\{color:#22c55e;font-weight:700\}', '.bold-green{color:#166534;font-weight:700}', html)

# If the CSS class doesn't exist yet, add it with darker green
if '.bold-green{' not in html:
    # Find the end of the style section and add the CSS class
    html = re.sub(r'(</style>)', r'.bold-green{color:#166534;font-weight:700}\n\1', html)

# Regex to find bullet point spans with a colon, regardless of span class
# Only wrap if not already wrapped in bold-green
pattern = re.compile(r'(<li[^>]*>\s*<span(?: [^>]*)?>)(?!<span class="bold-green">)([^<:]+):', re.MULTILINE)
replace = r'\1<span class="bold-green">\2</span>:'
html = pattern.sub(replace, html)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Done. Output written to {output_file}") 