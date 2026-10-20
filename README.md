# Welcome to Prima Aestate

Source of [www.primaaestate.cloud](https://www.primaaestate.cloud): lightweight apps for Mac, iPhone, iPad and Safari.

## Applications

| Name | Description | Download |
| --- | --- | --- |
| [Aestate](https://www.primaaestate.cloud/apps/aestate) | A lightweight, stable and easy-to-use network tool for Mac, iPhone and iPad, designed to minimize battery drain. | [App Store](https://apps.apple.com/us/app/aestate/id6749141594) |
| [NoMedia](https://www.primaaestate.cloud/apps/nomedia) | Remove images and media from Safari pages for cleaner, faster, data-saving reading. | [App Store](https://apps.apple.com/us/app/nomedia/id6683300799) |
| [Web Copilot](https://www.primaaestate.cloud/apps/web-copilot) | Let AI take over the browser: open, analyze and manipulate web pages through dialogue. | [App Store](https://apps.apple.com/us/app/web-copilot/id6755813748) |
| [Hello, Hero](https://www.primaaestate.cloud/apps/hello-hero) | Chat across time with historical figures, legendary heroes and opera stars. | [App Store](https://apps.apple.com/us/app/hello-hero/id6739343026) |
| [Console Mini](https://www.primaaestate.cloud/apps/console-mini) | A mini web development tool for macOS and iOS Safari. | [App Store](https://apps.apple.com/us/app/console-mini/id6744146152) |
| [URL Editor Portable](https://www.primaaestate.cloud/apps/url-editor-portable) | Easily view and edit every part of a URL: protocol, host, port, path and parameters. | [App Store](https://apps.apple.com/us/app/url-editor-portable/id6740315748) |
| [JSON Tree](https://www.primaaestate.cloud/apps/json-tree) | A lightweight, blazing-fast JSON tree previewer with no external dependencies. | [App Store](https://apps.apple.com/us/app/json-tree/id6702017445) |
| [Cashier Desk](https://www.primaaestate.cloud/apps/cashier-desk) | A fully offline order calculator with product, order and statistics management. | [App Store](https://apps.apple.com/us/app/cashier-desk/id6478970861) |

Open-source projects are listed on [yujinpan.github.io](https://yujinpan.github.io/#vue-components).

## Pages

- `/`: app cards (`docs/index.md`).
- `/apps/<slug>`: features, screenshots and What's New for each app (`docs/apps/<slug>.md`). Each page sets its own og/twitter share card, `docs/public/img/apps/<slug>/og.jpg` or `og-v2.jpg` (1200×630).
- `/updates`: release notes for all apps, newest first.
- `/Feedback`: feedback form. Submissions become public issues in [PrimaAestate/feedback](https://github.com/PrimaAestate/feedback) through the Cloudflare Worker in [`worker/`](worker/README.md). The app list is `docs/data/apps.json` (keep in sync with `worker/src/apps.json`).
- `/PrivacyPolicy`.

## Development

Built with [VitePress](https://vitepress.dev).

```sh
npm i
npm run docs:dev      # local preview
npm run docs:build    # output: docs/.vitepress/dist
```

## Deploy

Pushing to `master` runs `.github/workflows/main.yml`, which builds the site and publishes `docs/.vitepress/dist` to the `gh-pages` branch (GitHub Pages). The custom domain is set in `docs/public/CNAME` (`www.primaaestate.cloud`).

## App changelogs

App pages and `/updates` read release history from `docs/data/changelogs/<slug>.json`.

**Automatic (on release):** each app repo has `.github/workflows/notify-site.yml`. Pushing a `v*` tag reads the
version and en-US notes (`fastlane/i18n-release-notes.json`, falling back to `CHANGELOG.md`) and sends a
`repository_dispatch` (`app-release`) to this repo with `{slug, version, date, notes}`.
`.github/workflows/app-release.yml` here merges it (`scripts/merge-changelog.py`, upsert by version, Aestate wording
filter), commits to `master`, then builds and deploys (a push made with `GITHUB_TOKEN` does not trigger `main.yml`).
App repos need secret `SITE_DISPATCH_TOKEN`: a fine-grained PAT, repository access *PrimaAestate/primaaestate.github.io* only, permission *Contents: Read and write*.

Test locally:

```sh
printf '%s' '{"slug":"nomedia","version":"9.9.9","date":"2026-01-01","notes":"Bug Fixes\n\n- Example"}' > /tmp/p.json
python3 scripts/merge-changelog.py /tmp/p.json && git diff docs/data/changelogs
```

**Manual fallback / full rebuild from App Store Connect (read-only):**

```sh
pip install pyjwt cryptography requests
ASC_KEY_ID=... ASC_ISSUER_ID=... ASC_PRIVATE_KEY="$(cat AuthKey_XXXX.p8)" python3 scripts/fetch-changelogs.py          # all apps
python3 scripts/fetch-changelogs.py nomedia   # one app
```
