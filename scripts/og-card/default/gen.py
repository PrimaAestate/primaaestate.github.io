#!/usr/bin/env python3
"""Generate the site-wide default 1200x630 og/twitter share card.

Centered typography on a near-black field (no app icons, no logo):

    Prima Aestate                                          Cormorant Garamond Light
    Lightweight apps for Mac, iPhone and Safari            Inter Light
    primaaestate.cloud                                     Inter Light

Usage (from the repo root):

    python3 scripts/og-card/default/gen.py                 # writes docs/public/og-default.jpg
    python3 scripts/og-card/default/gen.py --out /tmp/og.png

Requires: Python 3 + Pillow, and headless Google Chrome / Chromium
(set CHROME=/path/to/chrome if it is not on PATH). Fonts are bundled
under fonts/ (SIL OFL 1.1; see fonts/SOURCE.txt).

The JPEG is gitignored on master; publish it with ./scripts/publish-assets.sh.
"""
from __future__ import annotations

import argparse
import base64
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
FONTS = HERE / "fonts"
DEFAULT_OUT = ROOT / "docs/public/og-default.jpg"

W, H = 1200, 630
# Render at 2x, then Lanczos-down, so the thin serif holds up when shrunk.
SCALE = 2

BRAND = "Prima Aestate"
TAGLINE = "Lightweight apps for Mac, iPhone and Safari"
DOMAIN = "primaaestate.cloud"

# Neutral near-black: soft center lift + vignette, no blue in the field.
BG = "radial-gradient(ellipse 85% 75% at 50% 42%, #161616 0%, #0a0a0a 58%, #050505 100%)"
TITLE = "#f6f3ee"
SUB = "#a8a49e"
META = "#8c8882"

# JPEG: high quality, 4:4:4 so hairlines in the serif title are not chroma-smeared.
JPEG_OPTS = dict(quality=95, optimize=True, progressive=True, subsampling=0)


def find_chrome() -> str:
    for c in (os.environ.get("CHROME"), "google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        if c and shutil.which(c):
            return shutil.which(c)
    sys.exit("Chrome/Chromium not found; set CHROME=/path/to/chrome")


def data_uri(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def font_face(family: str, path: Path, weight_range: str) -> str:
    uri = data_uri(path, "font/truetype")
    return (
        f'@font-face {{ font-family: "{family}"; src: url("{uri}") format("truetype"); '
        f"font-weight: {weight_range}; font-style: normal; font-display: block; }}"
    )


def card_html() -> str:
    faces = "\n".join(
        [
            font_face(
                "Cormorant Garamond",
                FONTS / "cormorant-garamond/CormorantGaramond-Variable.ttf",
                "300 700",
            ),
            font_face("InterVF", FONTS / "inter/Inter-Variable.ttf", "100 900"),
        ]
    )
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
{faces}
html, body {{ margin: 0; width:{W}px; height:{H}px; overflow: hidden; }}
body {{
  background: {BG};
  color: {TITLE};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}}
.frame {{
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 0 88px;
  box-sizing: border-box;
}}
.brand {{
  margin: 0;
  font-family: "Cormorant Garamond", serif;
  font-weight: 300;
  font-size: 108px;
  letter-spacing: 0.04em;
  line-height: 1;
  color: {TITLE};
  font-optical-sizing: auto;
}}
.tag {{
  margin: 28px 0 0;
  font-family: "InterVF", sans-serif;
  font-weight: 300;
  font-size: 32px;
  letter-spacing: 0.03em;
  line-height: 1.3;
  color: {SUB};
  font-optical-sizing: auto;
  max-width: 100%;
  white-space: nowrap;
}}
.domain {{
  margin: 40px 0 0;
  font-family: "InterVF", sans-serif;
  font-weight: 300;
  font-size: 26px;
  letter-spacing: 0.14em;
  line-height: 1;
  color: {META};
  font-optical-sizing: auto;
}}
</style></head><body>
<div class="frame">
  <h1 class="brand">{BRAND}</h1>
  <p class="tag">{TAGLINE}</p>
  <p class="domain">{DOMAIN}</p>
</div>
</body></html>"""


def render(dest: Path) -> Path:
    chrome = find_chrome()
    tmp = Path(tempfile.mkdtemp(prefix="og-default-"))
    try:
        hp = tmp / "card.html"
        hp.write_text(card_html())
        png = tmp / "card.png"
        subprocess.run(
            [
                chrome,
                "--headless=new",
                "--disable-gpu",
                "--hide-scrollbars",
                "--no-sandbox",
                f"--force-device-scale-factor={SCALE}",
                f"--window-size={W},{H}",
                f"--screenshot={png}",
                "file://" + str(hp),
            ],
            check=True,
            capture_output=True,
        )
        im = Image.open(png).convert("RGB")
        target = (W * SCALE, H * SCALE)
        if im.size != target:
            im = im.crop((0, 0, min(im.width, target[0]), min(im.height, target[1])))
            if im.size != target:
                canvas = Image.new("RGB", target, (0, 0, 0))
                canvas.paste(im, (0, 0))
                im = canvas
        im = im.resize((W, H), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.suffix.lower() in {".jpg", ".jpeg"}:
            im.save(dest, "JPEG", **JPEG_OPTS)
        else:
            im.save(dest, "PNG")
        return dest
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", help=f"output path (default: {DEFAULT_OUT})")
    a = ap.parse_args()
    dest = Path(a.out).resolve() if a.out else DEFAULT_OUT
    render(dest)
    print(f"wrote {dest} ({dest.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
