# Share cards (og-card)

Generates the 1200×630 og/twitter share cards for the app pages:
`docs/public/img/apps/<slug>/og.jpg`. Each `docs/apps/<slug>.md` points its `og:image` and `twitter:image` at that file.

The card shows the app icon and name, a headline and a subline on the left, and the app screen inside a generic
CSS-drawn phone on the right (round camera dot, generic status bar). No Apple device frames or Apple fonts are used.

This folder is outside `docs/`, so it is not part of the VitePress build.

## Default site card

The site-wide default share card (`docs/public/og-default.jpg`) is used by pages that do not set their own
`og:image` (home, `/updates`, `/Feedback`, `/PrivacyPolicy`). It is a centered typographic card on a near-black
field: the brand name in [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant) Light, the tagline
and domain in [Inter](https://github.com/rsms/inter) Light. No app icons and no logo. Both fonts are SIL OFL 1.1
and are bundled under `default/fonts/` (see `default/fonts/SOURCE.txt` and each family's `OFL.txt`).

```sh
python3 scripts/og-card/default/gen.py                 # writes docs/public/og-default.jpg
python3 scripts/og-card/default/gen.py --out /tmp/og-default.png
```

The JPEG is gitignored on `master`. After regenerating it, publish with `./scripts/publish-assets.sh`.
The file path stays `/og-default.jpg`; when the image itself changes, bump the `?v=` query on
`og:image` / `twitter:image` in `docs/.vitepress/config.ts` so CDNs and link crawlers refetch it.

## Run

Requirements:

- Python 3 with Pillow (`pip install pillow`)
- Google Chrome or Chromium, used headless to render the card (set `CHROME=/path/to/chrome` if it is not on `PATH`)
- The [Inter](https://github.com/rsms/inter) font installed on the system (SIL OFL 1.1; not committed here)

```sh
python3 scripts/og-card/gen.py                    # all cards, writes docs/public/img/apps/<slug>/og.jpg
python3 scripts/og-card/gen.py hello-hero         # one card
python3 scripts/og-card/gen.py hello-hero --out /tmp/hh.png   # preview without touching docs/
```

## Files

- `gen.py`: the generator.
- `configs/<slug>.json`: one config per card. Paths are relative to the repo root.
- `screens/<slug>.png`: the app screen shown in the phone.

Config fields:

| Field | Meaning |
| --- | --- |
| `name` | App name next to the icon |
| `headline` | Headline; use `<br>` for line breaks. Shrinks automatically if wider than `max_w` (default 590 px) |
| `sub` | Subline under the headline |
| `bg` | Card background (any CSS background, e.g. a `linear-gradient`) |
| `icon` | App icon, usually `docs/public/img/apps/<slug>/icon.png` |
| `screen` | Screen image, `scripts/og-card/screens/<slug>.png` |
| `skip_top_pt` | Points of page to skip below the status bar, to start the phone lower on the page (default 0) |
| `out` | Output file |
| optional | `sub_ink` (subline colour), `screen_bg`, `status_ink` (status bar colour, default `#111`), `ink`, `hl_size`, `hl_weight`, `sub_size`, `max_w` |

## Screens

The screens are not drawn here. Each one is a raw screen (1320×2868, iPhone 6.9" at @3x, top 62 pt reserved for the
status bar) produced by **the app repo's store screenshot script**, copied into `screens/<slug>.png`. Screens use
fictional content only. `screens/*.png` are **gitignored** on `master` (regenerable); keep them locally while iterating.

## Add or update a card

1. Generate the screens with the app repo's store screenshot script and copy the one you want to
   `screens/<slug>.png`.
2. Add or edit `configs/<slug>.json` (copy an existing one). Adjust `skip_top_pt` if the important part of the
   screen is cut off at the bottom.
3. Preview with `--out /tmp/<slug>.png`, then run without `--out` to write the card under
   `docs/public/img/apps/<slug>/`.
4. Overwrite `docs/public/img/apps/<slug>/og.jpg` (do not add `og-vN.jpg` version suffixes). Keep
   `og:image` / `twitter:image` pointing at that fixed URL. CDNs and link crawlers may keep an old card
   until they re-fetch; optional `?v=` on the meta URL can force a bust if needed.
5. Publish site images to the orphan `assets` branch (not `master`):

```sh
./scripts/publish-assets.sh
```

CI syncs that branch into `docs/public/` on every deploy. See the repo root README.
