import re

input_file = 'moderntechguidelines.html'
output_file = 'moderntechguidelines_cleaned.html'

with open(input_file, 'r', encoding='utf-8') as f:
    html = f.read()

# Remove all superscript notations (span class="c13" or similar)
html = re.sub(r'<span class="c[0-9]+">[0-9]+</span>', '', html)

# Remove all subscript notations (span class with sub or similar)
html = re.sub(r'<span class="[^"]*sub[^"]*">[^<]+</span>', '', html)

# Remove any remaining sup/sub tags
html = re.sub(r'<sup[^>]*>[^<]+</sup>', '', html)
html = re.sub(r'<sub[^>]*>[^<]+</sub>', '', html)

# Remove any vertical-align: super or sub from CSS
html = re.sub(r'vertical-align:\s*super;?', '', html)
html = re.sub(r'vertical-align:\s*sub;?', '', html)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Done. Output written to {output_file}")
print("All superscript and subscript notations have been removed.") 