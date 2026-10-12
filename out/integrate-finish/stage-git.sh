#!/usr/bin/env bash
# Stage the /integrate "Agent Army" finish as a git branch in vidiflow-hx.
# Baseline commit = the tree BEFORE the change; branch commit = the change.
# No push, no deploy. Safe to re-run: it rebuilds .git from scratch.
set -e
cd "M:/code/VidiBot/vidiflow-hx"
D="M:/code/VidiFlow/out/integrate-finish"
POST="$D/post-source"
GIT="git -c safe.directory=* -c user.name=Hermes -c user.email=vidiman@vidimail.com"

MODIFIED="src/components/Nav.tsx src/app/integrate/page.tsx src/app/integrate/layout.tsx src/app/integrate/IntegrateExtras.tsx src/app/integrate/engines.ts"
ADDED="src/lib/media.ts src/app/adapters/nvidia-nat/events/route.ts src/app/adapters/nvidia-nat/entities/route.ts src/app/adapters/nvidia-nat/graphs/route.ts"

echo "== 1. save the finished (post-change) files =="
rm -rf "$POST"; mkdir -p "$POST"
for f in $MODIFIED $ADDED; do mkdir -p "$POST/$(dirname "$f")"; cp "$f" "$POST/$f"; done
cp public/integrate/shots/gemini-api-home.jpg "$POST/gemini-api-home.jpg"
echo "   saved: $(find "$POST" -type f | wc -l) files"

echo "== 2. restore the pre-change baseline into the tree =="
for f in $MODIFIED; do cp "$D/before-source/$f" "$f"; done
for f in $ADDED; do rm -f "$f"; done
rmdir src/app/adapters/nvidia-nat/events src/app/adapters/nvidia-nat/entities src/app/adapters/nvidia-nat/graphs src/app/adapters/nvidia-nat 2>/dev/null || true
rm -f public/integrate/shots/gemini-api-home.jpg
echo "   baseline: media.ts exists? $(test -f src/lib/media.ts && echo yes || echo no); nvidia-nat dir? $(test -d src/app/adapters/nvidia-nat && echo yes || echo no)"

echo "== 3. baseline commit =="
rm -rf .git
git init -q -b master
$GIT add -A
$GIT commit -q -m "baseline: vidiflow-hx /integrate before the Agent Army finish (2026-10-11)"
$GIT log --oneline

echo "== 4. branch + finished state =="
$GIT checkout -q -b agent-army-integrate-finish
for f in $MODIFIED $ADDED; do mkdir -p "$(dirname "$f")"; cp "$POST/$f" "$f"; done
cp "$POST/gemini-api-home.jpg" public/integrate/shots/gemini-api-home.jpg
$GIT add -A
$GIT commit -q -m "Finish the /integrate Agent Army page: nav, sections, endpoints, layout

- Top bar: new primary link Agent Army -> /integrate, plus an Agent Army
  section in the Product dropdown and the mobile menu with a deep link to
  each of the 8 harness cards.
- Page: eyebrow 'Agent Army - 8 agent harnesses', on-page section bar
  (Harnesses / Timeline / Adapters / Dashboards / At work), and an
  8-harness index replacing the 5-logo strip.
- Cards: release order, anchor per harness, honest statuses (Demo endpoints
  / Adapter planned) replacing 'Stub ready' / 'Gateway stub', h3 headings.
- Fixed the 3 nvidia-nat endpoints that returned 404 by adding demo stubs.
- Dashboards gallery: 6 shots, 3x2, each linking to its card.
- Layout: 1280/390 - no overflow, no clipping, no widows; desktop timeline
  is two rows of four so labels have room; card titles wrap instead of
  being truncated."

echo "== 5. the change on the branch =="
$GIT diff --stat master..agent-army-integrate-finish
echo "== 6. sanity =="
$GIT status --short | head
echo "branch: $($GIT rev-parse --abbrev-ref HEAD)  head: $($GIT rev-parse --short HEAD)  files tracked: $($GIT ls-files | wc -l)"