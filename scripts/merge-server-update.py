#!/usr/bin/env python3
"""Upsert one server update into docs/data/server-updates/shared.json.

Usage: python3 scripts/merge-server-update.py payload.json
payload: {"date"?, "version"?, "apps"?, "notes", "extras"?}
"""
import datetime
import importlib.util
import json
import os
import re
import sys

here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("fc", os.path.join(here, "fetch-changelogs.py"))
fc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fc)

DEFAULT_APPS = ["hello-hero", "web-copilot"]
FORBIDDEN = re.compile(
    r"https?:|tencentscf|\bSCF\b|digest|live\d+|[0-9a-f]{40}|sales|requestId|installId",
    re.I,
)


def normalize_notes(text, field="notes"):
    value = re.sub(r"\n{3,}", "\n\n", str(text or "").replace("\r\n", "\n").strip())
    if not value:
        sys.exit(f"missing {field}")
    if len(value) > 5000:
        sys.exit(f"{field} exceeds 5000 characters")
    if FORBIDDEN.search(value):
        sys.exit(f"{field} contains forbidden internal/private terms")
    return value


p = json.load(open(sys.argv[1], encoding="utf-8"))

raw_version = str(p.get("version") or "").strip()
version = None
if raw_version:
    clean_ver = raw_version.lstrip("v")
    if not re.fullmatch(r"\d+(\.\d+)+", clean_ver):
        sys.exit(f"bad version: {raw_version!r}")
    version = f"v{clean_ver}"

date = str(p.get("date") or datetime.date.today().isoformat()).strip()
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
    sys.exit(f"bad date: {date!r}")

raw_apps = p.get("apps") if p.get("apps") is not None else DEFAULT_APPS
if not isinstance(raw_apps, list) or not raw_apps:
    sys.exit("apps must be a non-empty list")
apps = []
for slug in raw_apps:
    if slug not in fc.APPS:
        sys.exit(f"unknown app slug: {slug!r}")
    if slug not in apps:
        apps.append(slug)

notes = normalize_notes(p.get("notes"), "notes")

raw_extras = p.get("extras") or {}
if not isinstance(raw_extras, dict):
    sys.exit("extras must be an object")
extras = {}
for slug, extra_text in raw_extras.items():
    if slug not in apps:
        sys.exit(f"extras slug {slug!r} must be listed in apps")
    if extra_text is not None and str(extra_text).strip():
        extras[slug] = normalize_notes(extra_text, f"extras.{slug}")

path = os.path.join(here, "..", "docs", "data", "server-updates", "shared.json")
rows = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else []


def matches(row):
    if version:
        if row.get("version") == version:
            return True
        return not row.get("version") and row.get("date") == date
    return not row.get("version") and row.get("date") == date


old = next((r for r in rows if matches(r)), None)
entry = {"date": date}
if version:
    entry["version"] = version
entry["apps"] = apps
entry["notes"] = notes
if extras:
    entry["extras"] = extras

kept = []
replaced = False
for r in rows:
    if not replaced and matches(r):
        replaced = True
        continue
    kept.append(r)

kept.append(entry)
kept.sort(key=lambda e: e.get("date", ""), reverse=True)

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w", encoding="utf-8") as f:
    json.dump(kept, f, indent=2, ensure_ascii=False)
    f.write("\n")

label = f"{version} ({date})" if version else date
print(f"server-update {label}: {'updated' if old else 'added'}")
