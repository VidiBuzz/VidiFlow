import re, collections

TOKENS = {0.6875:'--fs-2xs', 0.75:'--fs-xs', 0.875:'--fs-sm', 1.0:'--fs-base',
          1.125:'--fs-md', 1.375:'--fs-lg', 1.75:'--fs-xl', 2.25:'--fs-2xl',
          3.0:'--fs-3xl', 3.75:'--fs-4xl'}
tvals = sorted(TOKENS)

def nearest(v):
    return min(tvals, key=lambda t: abs(t - v))

s = open('index.html', encoding='utf-8').read()

# Match only plain "font-size: <num>rem" (space or not), not clamp()/vw/px.
pat = re.compile(r'font-size:(\s*)(\d*\.?\d+)rem\b')

mapping = collections.Counter()
def repl(m):
    v = float(m.group(2))
    if v in TOKENS:
        return m.group(0)  # already a token value; leave numeric (fine) -- will swap below
    t = nearest(v)
    mapping[(m.group(2), TOKENS[t])] += 1
    return 'font-size:' + m.group(1) + 'var(' + TOKENS[t] + ')'

new, n = pat.subn(repl, s)

# Also convert remaining exact-token literals (e.g. 0.875rem) to var() for consistency
for val, tok in TOKENS.items():
    lit = ('%g' % val)
    for sp in ('', ' '):
        before = new.count('font-size:' + sp + lit + 'rem')
        new = new.replace('font-size:' + sp + lit + 'rem', 'font-size:' + sp + 'var(' + tok + ')')
        if before:
            mapping[('(exact) ' + lit, tok)] += before

open('index.html', 'w', encoding='utf-8').write(new)
print('substitutions (non-exact):', n)
print('MAPPING  raw_rem -> token')
for (raw, tok), c in sorted(mapping.items(), key=lambda x: x[0][0]):
    print(f'  {str(raw):>10}rem -> {tok:<10} x{c}')
print('remaining plain rem font-size decls:', len(pat.findall(new)))
