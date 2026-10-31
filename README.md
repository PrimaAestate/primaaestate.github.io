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
