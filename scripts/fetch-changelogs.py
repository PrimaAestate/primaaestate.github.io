#!/usr/bin/env python3
"""Refresh docs/data/changelogs/<slug>.json from App Store Connect (read-only).

Needs env ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY (.p8 contents) and
`pip install pyjwt cryptography requests`. Usage: python3 scripts/fetch-changelogs.py [slug ...]
"""
import os, re, sys, json, time, textwrap
import jwt, requests

APPS = {
    "aestate": "6749141594", "nomedia": "6683300799", "web-copilot": "6755813748",
    "hello-hero": "6739343026", "console-mini": "6744146152",
    "url-editor-portable": "6740315748", "json-tree": "6702017445", "cashier-desk": "6478970861",
}
# Aestate page stays neutral: drop lines mentioning these terms.
NEUTRAL = {"aestate": re.compile(r"proxy|vpn|vless|vmess|shadowsocks|trojan|reality|xtls|xudp|anytls|grpc|socks|sni|clienthello|tunnel|udp|censor|bypass|protocol|subscription|(?<!dns )servers?\b(?! *(switch|change))|tls|relay|always on|transport", re.I)}
OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "data", "changelogs")
LIVE = ("READY_FOR_SALE", "REPLACED_WITH_NEW_VERSION", "READY_FOR_DISTRIBUTION")

def token():
    raw = os.environ["ASC_PRIVATE_KEY"]
    body = re.sub(r"-----[A-Z ]+-----", "", raw).replace("\\n", "").replace("\n", "").replace(" ", "")
    pem = "-----BEGIN PRIVATE KEY-----\n" + "\n".join(textwrap.wrap(body, 64)) + "\n-----END PRIVATE KEY-----\n"
    now = int(time.time())
    return jwt.encode({"iss": os.environ["ASC_ISSUER_ID"], "iat": now, "exp": now + 1100, "aud": "appstoreconnect-v1"},
                      pem, algorithm="ES256", headers={"kid": os.environ["ASC_KEY_ID"]})

H = {}
def get(path, **params):
    for _ in range(5):
        try:
            r = requests.get("https://api.appstoreconnect.apple.com" + path, headers=H, params=params, timeout=60)
            r.raise_for_status()
            return r.json()
        except requests.ConnectionError:
            time.sleep(3)
    raise SystemExit("ASC request failed: " + path)

def clean(slug, notes):
    lines = (notes or "").strip().splitlines()
    m = re.match(r"^\s*v?\d+(\.\d+)+\s*\((\d{4}-\d{2}-\d{2})\)\s*$", lines[0]) if lines else None
    date = m.group(2) if m else None
    if m: lines = lines[1:]
    pat = NEUTRAL.get(slug)
    if pat: lines = [l for l in lines if not pat.search(l)]
    # drop section headings left without items
    out = []
    for i, l in enumerate(lines):
        if l.strip() and not l.lstrip().startswith(("-", "•", "*")) and len(l) < 40:
            nxt = next((x for x in lines[i + 1:] if x.strip()), "")
            if not nxt.lstrip().startswith(("-", "•", "*")): continue
        out.append(l)
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()
    if pat and notes and not re.search(r"\w", text): text = "Stability and performance improvements."
    return date, text

def fetch(slug, app_id):
    vs = get(f"/v1/apps/{app_id}/appStoreVersions", limit=200)["data"]
    byver = {}
    for v in vs:
        a = v["attributes"]
        if a["appStoreState"] not in LIVE: continue
        locs = get(f"/v1/appStoreVersions/{v['id']}/appStoreVersionLocalizations", limit=50)["data"]
        en = next((l for l in locs if l["attributes"]["locale"] == "en-US"), None) or \
             next((l for l in locs if l["attributes"]["locale"].startswith("en")), None)
        date, notes = clean(slug, en and en["attributes"].get("whatsNew"))
        e = byver.setdefault(a["versionString"], {"version": a["versionString"], "date": None, "platforms": [], "notes": ""})
        e["platforms"].append({"IOS": "iOS", "MAC_OS": "macOS"}.get(a["platform"], a["platform"]))
        e["date"] = min(filter(None, [e["date"], date or a["createdDate"][:10]]))
        if notes and len(notes) > len(e["notes"]): e["notes"] = notes
    key = lambda e: [int(x) if x.isdigit() else 0 for x in e["version"].split(".")]
    rows = sorted(byver.values(), key=key, reverse=True)
    for e in rows: e["platforms"] = sorted(set(e["platforms"]))
    return rows

if __name__ == "__main__":
    H["Authorization"] = "Bearer " + token()
    os.makedirs(OUT, exist_ok=True)
    for slug in sys.argv[1:] or APPS:
        rows = fetch(slug, APPS[slug])
        json.dump(rows, open(os.path.join(OUT, slug + ".json"), "w"), indent=2, ensure_ascii=False)
        print(slug, len(rows), "versions")
