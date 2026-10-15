#!/usr/bin/env python3
"""Upsert one release into docs/data/changelogs/<slug>.json.

Usage: python3 scripts/merge-changelog.py payload.json
payload: {"slug", "version", "date"?, "platforms"?, "notes"?}
"""
import json, os, re, sys, datetime, importlib.util

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("fc", os.path.join(here, "fetch-changelogs.py"))
fc = importlib.util.module_from_spec(spec); spec.loader.exec_module(fc)

p = json.load(open(sys.argv[1]))
slug, version = p.get("slug"), str(p.get("version", "")).lstrip("v")
if slug not in fc.APPS: sys.exit(f"unknown slug: {slug!r}")
if not re.fullmatch(r"\d+(\.\d+)*", version): sys.exit(f"bad version: {version!r}")
date = p.get("date") or datetime.date.today().isoformat()
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date): sys.exit(f"bad date: {date!r}")
raw = str(p.get("notes") or "")[:5000]
hdr_date, notes = fc.clean(slug, f"{version} ({date})\n" + raw if raw else "")
path = os.path.join(here, "..", "docs", "data", "changelogs", slug + ".json")
rows = json.load(open(path)) if os.path.exists(path) else []
old = next((r for r in rows if r["version"] == version), None)
plats = p.get("platforms") or (old or {}).get("platforms") or sorted({x for r in rows[:3] for x in r["platforms"]})
entry = {"version": version, "date": (old or {}).get("date") or date, "platforms": sorted(set(plats)),
         "notes": notes or (old or {}).get("notes", "")}
rows = [r for r in rows if r["version"] != version] + [entry]
key = lambda e: [int(x) for x in e["version"].split(".")]
rows.sort(key=key, reverse=True)
json.dump(rows, open(path, "w"), indent=2, ensure_ascii=False)
print(f"{slug} {version}: {'updated' if old else 'added'}")
