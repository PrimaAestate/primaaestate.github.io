#!/usr/bin/env bash
# Rebuild the orphan `assets` branch from local docs/public images and force-push.
# Does not touch master or gh-pages. Requires network + push access.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

img_dir="docs/public/img"
og="docs/public/og-default.jpg"
if [[ ! -d "$img_dir" ]]; then
  echo "missing $img_dir — generate or run ./scripts/sync-assets.sh first" >&2
  exit 1
fi
if [[ ! -f "$og" ]]; then
  echo "missing $og" >&2
  exit 1
fi

wt="$(mktemp -d "${TMPDIR:-/tmp}/pa-publish-assets.XXXXXX")"
cleanup() { git worktree remove --force "$wt" 2>/dev/null || rm -rf "$wt"; }
trap cleanup EXIT

git fetch origin master
git worktree add --detach "$wt" origin/master
(
  cd "$wt"
  git checkout --orphan assets-new
  git read-tree --empty
  mkdir -p img
  cp -a "$root/$img_dir/." img/
  cp "$root/$og" og-default.jpg
  cat > README.md << 'README'
# Site static images (orphan branch)

Marketing / page images for [primaaestate.github.io](https://github.com/PrimaAestate/primaaestate.github.io).

Tree layout matches `docs/public/` image paths:

- `img/apps/<slug>/…` — icons, page shots, og cards
- `og-default.jpg` — site-wide default OG image

This branch is **force-pushed as a single orphan commit** on each update (no history kept).
CI checks it out into `docs/public/` before `vitepress build`. Pages still publish from `gh-pages`.

Update from a clone of `master` (after regenerating images under `docs/public/`):

```sh
./scripts/publish-assets.sh
```
README
  git add img og-default.jpg README.md
  git commit -m "chore(assets): refresh site images (orphan tip)"
  git push --force origin HEAD:assets
  echo "Pushed orphan assets @ $(git rev-parse HEAD)"
)
