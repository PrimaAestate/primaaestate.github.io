// One renderer/data model for app releases and separately maintained server notes.
// Server dates/optional tags are not App Store version numbers.
// Shared service history lives in docs/data/server-updates/shared.json.

export const APP_NAMES = {
  aestate: 'Aestate',
  nomedia: 'NoMedia',
  'web-copilot': 'Web Copilot',
  'hello-hero': 'Hello, Hero',
  'console-mini': 'Console Mini',
  'url-editor-portable': 'URL Editor Portable',
  'json-tree': 'JSON Tree',
  'cashier-desk': 'Cashier Desk',
};

export function newestFirst(a, b) {
  return (b.date || '').localeCompare(a.date || '');
}

// App-specific extras are inserted before the last bullet of the shared notes
// so a common closing line (for example IAP prices) stays last.
export function resolveServerNotes(entry, slug) {
  const notes = entry && entry.notes ? entry.notes : '';
  const extra = entry && entry.extras && slug ? entry.extras[slug] : undefined;
  if (!extra) return notes;
  const lines = notes.split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('- ')) last = i;
  }
  if (last < 0) return notes ? `${notes}\n${extra}` : extra;
  return [...lines.slice(0, last), extra, ...lines.slice(last)].join('\n');
}

export function serverUpdatesForApp(shared = [], slug) {
  return shared
    .filter((entry) => Array.isArray(entry.apps) && entry.apps.includes(slug))
    .map((entry) => {
      const row = {date: entry.date, notes: resolveServerNotes(entry, slug)};
      if (entry.version) row.version = entry.version;
      return row;
    });
}

export function changelogEntries(appReleases, serverUpdates = []) {
  const apps = appReleases.map(entry => ({...entry, kind: 'app', key: `app:${entry.version}`}));
  const servers = serverUpdates.map(entry => ({...entry, kind: 'server', key: `server:${entry.date}:${entry.version || ''}`}));
  // Keep existing version order untouched on pages without server updates.
  return servers.length ? [...apps, ...servers].sort(newestFirst) : apps;
}

// Combined /updates feed: each shared server row appears once, with its apps list.
export function updatesFeed(changelogFiles = {}, shared = []) {
  const appRows = Object.entries(changelogFiles).flatMap(([slug, rows]) =>
    changelogEntries(rows, []).map((entry) => ({
      ...entry,
      slug,
      name: APP_NAMES[slug] || slug,
      apps: [slug],
    })),
  );
  const serverRows = shared.map((entry) => ({
    ...entry,
    kind: 'server',
    key: `server:${entry.date}:${entry.version || ''}`,
    apps: Array.isArray(entry.apps) ? entry.apps : [],
  }));
  return [...appRows, ...serverRows].sort(newestFirst);
}

export function entryLabel(entry) {
  return entry.kind === 'server'
    ? `Server update${entry.version ? ` · ${entry.version}` : ''}`
    : entry.version;
}

export function entryMeta(entry) {
  return entry.kind === 'server' || !entry.platforms?.length
    ? entry.date
    : `${entry.date} · ${entry.platforms.join(', ')}`;
}

export function entryNotes(entry, slug) {
  if (entry && entry.kind === 'server' && (entry.extras || slug)) {
    const resolved = slug ? resolveServerNotes(entry, slug) : (entry.notes || '');
    return resolved;
  }
  return entry.notes || (entry.kind === 'app' && entry.version === '1.0' ? 'Initial release.' : '');
}

export function entryNotesWithExtras(entry) {
  const notes = entry && entry.notes ? entry.notes : '';
  const extras = entry && entry.extras ? entry.extras : {};
  const apps = Array.isArray(entry && entry.apps) ? entry.apps : Object.keys(extras);
  const blocks = [];
  for (const slug of apps) {
    if (!extras[slug]) continue;
    blocks.push(`${APP_NAMES[slug] || slug}\n${extras[slug]}`);
  }
  const extraText = blocks.join('\n');
  if (!extraText) return notes;
  if (!notes) return extraText;
  // Keep labeled extras in the same section, before the last shared bullet.
  const lines = notes.split('\n');
  let last = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('- ')) last = i;
  }
  if (last < 0) return `${notes}\n${extraText}`;
  return [...lines.slice(0, last), extraText, ...lines.slice(last)].join('\n');
}
