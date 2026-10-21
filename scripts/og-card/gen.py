#!/usr/bin/env python3
"""Generate the 1200x630 og/twitter share cards for the app pages (docs/public/img/apps/<slug>/og-v3.jpg).

Layout: brand + headline + subline on the left, a generic CSS-drawn phone on the right
(no Apple device frames, no Apple-shaped notch / island; a small round camera dot; Inter text).

Usage (from the repo root or anywhere):
    python3 scripts/og-card/gen.py                 # all configs in scripts/og-card/configs/
    python3 scripts/og-card/gen.py hello-hero      # one or more slugs
    python3 scripts/og-card/gen.py web-copilot --out /tmp/wc.png   # write elsewhere (single slug)

Requires: Python 3 + Pillow, headless Google Chrome / Chromium (set CHROME=/path/to/chrome to override),
and the Inter font installed system-wide (https://github.com/rsms/inter, SIL OFL 1.1).
All paths in configs are relative to the repo root.
"""
import argparse, base64, json, os, shutil, subprocess, sys, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
CONFIGS = os.path.join(HERE, 'configs')

# phone geometry (css px); outer and inner radii are concentric: R_IN = R_OUT - BEZEL
PH_L, PH_T, PH_W, PH_H = 720, 56, 400, 660
BEZEL, R_OUT = 14, 62
R_IN = R_OUT - BEZEL
SCR_W = PH_W - 2 * BEZEL
STATUS_H = 46          # generic status bar drawn over the top of the screen

# store screenshot screens are 440 pt wide (@3x) and reserve the top 62 pt for a status bar
SCREEN_PT_W = 440
SCREEN_TOP_PT = 62

DEFAULTS = dict(status_ink='#111', screen_bg='#fff', hl_size=72, hl_weight=800, hl_ls=-1.2, hl_lh=1.06,
                sub_size=28.5, gap=21, max_w=590, ink='#fff', sub_ink='rgba(255,255,255,.72)', skip_top_pt=0)


def find_chrome():
    for c in (os.environ.get('CHROME'), 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'):
        if c and shutil.which(c):
            return shutil.which(c)
    sys.exit('Chrome/Chromium not found; set CHROME=/path/to/chrome')


def data_uri(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


def rel(p):
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def prepare_screen(path, skip_top_pt, tmp):
    """Fit the store screen into the phone.

    skip_top_pt > 0: keep the reserved status strip and drop that many pt of page right below it
    (to show the part of the page that matters). The reserved strip is then trimmed so that
    STATUS_H px remain for the generic status bar.
    """
    im = Image.open(path).convert('RGB')
    s = im.width / SCREEN_PT_W
    top = int(SCREEN_TOP_PT * s)
    if skip_top_pt:
        sk = int(skip_top_pt * s)
        cut = Image.new('RGB', (im.width, im.height - sk))
        cut.paste(im.crop((0, 0, im.width, top)), (0, 0))
        cut.paste(im.crop((0, top + sk, im.width, im.height)), (0, top))
        im = cut
    k = SCR_W / im.width
    keep = max(0, top - int(STATUS_H / k))
    im = im.crop((0, keep, im.width, im.height)).resize((SCR_W, int((im.height - keep) * k)), Image.LANCZOS)
    p = os.path.join(tmp, 'screen.png')
    im.save(p)
    return p


def render(cfg, out):
    c = dict(DEFAULTS, **cfg)
    tmp = tempfile.mkdtemp()
    try:
        sp = prepare_screen(rel(c['screen']), c['skip_top_pt'], tmp)
        html = f"""<!doctype html><html><head><meta charset=utf-8><style>
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{background:{c['bg']};font-family:Inter,sans-serif;color:{c['ink']};position:relative;-webkit-font-smoothing:antialiased}}
.brand{{position:absolute;left:84px;top:56px;display:flex;align-items:center;gap:14px;font-weight:600;font-size:22px;letter-spacing:-.2px}}
.brand img{{width:40px;height:40px;border-radius:10px}}
.copy{{position:absolute;left:84px;top:0;bottom:0;width:640px;padding-top:30px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center}}
h1{{margin:0;white-space:nowrap;display:inline-block;align-self:flex-start;font-weight:{c['hl_weight']};font-size:{c['hl_size']}px;line-height:{c['hl_lh']};letter-spacing:{c['hl_ls']}px}}
p{{margin:{c['gap']}px 0 0;font-size:{c['sub_size']}px;font-weight:400;color:{c['sub_ink']};letter-spacing:-.2px}}
/* generic phone: dark body, soft edge highlight, concentric screen corners */
.phone{{position:absolute;left:{PH_L}px;top:{PH_T}px;width:{PH_W}px;height:{PH_H}px;box-sizing:border-box;padding:{BEZEL}px;
  border-radius:{R_OUT}px;background:linear-gradient(160deg,#2c2d31 0%,#141417 45%,#1d1e22 100%);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),inset 0 0 0 3px #0b0b0d,0 18px 44px rgba(0,0,0,.22),0 2px 6px rgba(0,0,0,.12)}}
.screen{{position:relative;width:{SCR_W}px;height:{PH_H - BEZEL}px;border-radius:{R_IN}px {R_IN}px 0 0;overflow:hidden;background:{c['screen_bg']};
  box-shadow:0 0 0 1px rgba(0,0,0,.6)}}
.screen>img{{display:block;width:{SCR_W}px}}
.sb{{position:absolute;left:0;right:0;top:0;height:{STATUS_H}px;display:flex;align-items:center;justify-content:space-between;
  padding:0 30px 0 34px;box-sizing:border-box;color:{c['status_ink']};font:600 15px/1 Inter,sans-serif;letter-spacing:-.1px}}
.cam{{position:absolute;left:50%;top:13px;width:11px;height:11px;margin-left:-5.5px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#3a3f4a 0%,#0c0d10 60%);box-shadow:0 0 0 1.5px rgba(0,0,0,.85)}}
.ic{{display:flex;align-items:flex-end;gap:7px}}
.sig{{display:flex;align-items:flex-end;gap:2px;height:11px}} .sig i{{display:block;width:3px;border-radius:1px;background:currentColor}}
.bat{{position:relative;width:22px;height:11px;border:1.5px solid currentColor;border-radius:3.5px;box-sizing:border-box;opacity:.95;margin-bottom:0}}
.bat::before{{content:'';position:absolute;left:1.5px;top:1.5px;bottom:1.5px;width:70%;border-radius:1.5px;background:currentColor}}
.bat::after{{content:'';position:absolute;right:-4px;top:3px;width:2px;height:3px;border-radius:0 1px 1px 0;background:currentColor;opacity:.6}}
</style></head><body>
<div class=brand><img src="{data_uri(rel(c['icon']))}">{c['name']}</div>
<div class=copy><h1>{c['headline']}</h1><p>{c['sub']}</p></div>
<div class=phone><div class=screen><img src="{data_uri(sp)}">
  <div class=sb><span>9:41</span><span class=ic><span class=sig><i style="height:4px"></i><i style="height:6px"></i><i style="height:8.5px"></i><i style="height:11px"></i></span><span class=bat></span></span></div>
  <div class=cam></div></div></div>
<script>
const h=document.querySelector('h1');let f={c['hl_size']};
while(h.getBoundingClientRect().width>{c['max_w']}&&f>40){{f-=0.5;h.style.fontSize=f+'px';}}
</script></body></html>"""
        hp = os.path.join(tmp, 'card.html')
        open(hp, 'w').write(html)
        png = os.path.join(tmp, 'card.png')
        subprocess.run([find_chrome(), '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--window-size=1200,630', f'--screenshot={png}', 'file://' + hp], check=True, capture_output=True)
        im = Image.open(png).convert('RGB')
        assert im.size == (1200, 630), im.size
        os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
        if out.lower().endswith(('.jpg', '.jpeg')):
            im.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
        else:
            im.save(out)
        return out
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('slugs', nargs='*', help='app slugs (default: every config in configs/)')
    ap.add_argument('--out', help='output path (only with a single slug); default is the "out" field of the config')
    a = ap.parse_args()
    slugs = a.slugs or sorted(f[:-5] for f in os.listdir(CONFIGS) if f.endswith('.json'))
    if a.out and len(slugs) != 1:
        ap.error('--out needs exactly one slug')
    for slug in slugs:
        cfg = json.load(open(os.path.join(CONFIGS, slug + '.json')))
        out = a.out or rel(cfg.pop('out'))
        cfg.pop('out', None)
        print(render(cfg, out))


if __name__ == '__main__':
    main()
