#!/usr/bin/env bash
# Pull the orphan `assets` branch into docs/public/ for local docs:dev.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

git fetch --depth=1 origin assets
# Replace tracked image trees only; leave CNAME / logo.svg alone.
rm -rf docs/public/img
git archive origin/assets | tar -x -C docs/public --exclude=README.md

echo "Synced origin/assets → docs/public/ (img/, og-default.jpg)"
test -f docs/public/og-default.jpg
test -d docs/public/img/apps
