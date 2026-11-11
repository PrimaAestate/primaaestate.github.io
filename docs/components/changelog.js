// One renderer/data model for app releases and separately maintained server notes.
// Server dates/optional tags are not App Store version numbers.
export function changelogEntries(appReleases, serverUpdates = []) {
  const apps = appReleases.map(entry => ({...entry, kind: 'app', key: `app:${entry.version}`}));
  const servers = serverUpdates.map(entry => ({...entry, kind: 'server', key: `server:${entry.date}:${entry.version || ''}`}));
  // Keep existing version order untouched on pages without server updates.
  return servers.length ? [...apps, ...servers].sort(newestFirst) : apps;
}

export function newestFirst(a, b) {
  return (b.date || '').localeCompare(a.date || '');
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

export function entryNotes(entry) {
  return entry.notes || (entry.kind === 'app' && entry.version === '1.0' ? 'Initial release.' : '');
}
