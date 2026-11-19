import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'node:child_process';
import {
  changelogEntries, newestFirst, entryLabel, entryMeta, entryNotes,
  resolveServerNotes, serverUpdatesForApp, updatesFeed, entryNotesWithExtras, APP_NAMES,
} from '../docs/components/changelog.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const app = {version: '1.2.3', date: '2026-11-09', platforms: ['iOS', 'macOS'], notes: 'App release'};
const server = {date: '2026-11-11', notes: 'Service rollout'};
const CARBON_NOTES = "Features\n\n- Gemini 4 Carbon is now available alongside Gemini 4 Argon. Gemini 3.5 Flash-Lite remains the default model.\n- In app versions that support the server model list, Carbon appears after that list refreshes. Older versions may not show it.\n- Carbon uses the same component-based token pricing as Argon: introductory reference 11× until December 1, 2026 at 08:00 China Standard Time (UTC+8), then standard 23×. Actual deductions distinguish input, output/thinking, and cached tokens rather than applying one flat multiplier.\n- In-app purchase prices are unchanged.";
const PRICING_COMMON = "Features\n\n- Text-token deductions are lower: server reference multipliers change from 5× to 3× for Gemini 3.5 Flash-Lite, 9× to 5× for Gemini 3.8 Flash, and 23× to 11× for Gemini 4 Argon during its introductory period (standard: 46× to 23×). The reductions differ by model, not a uniform 50% discount.\n- Actual deductions still price input, output (including thinking), and cached tokens separately; the reference multiplier is not one flat rate for every token.\n- In-app purchase prices are unchanged.";
const HH_VOICE = "- Voice-reply pricing has increased. Text input and generated audio are now charged separately, replacing the previous total-token rule.";
const HH_PRICING = "Features\n\n- Text-token deductions are lower: server reference multipliers change from 5× to 3× for Gemini 3.5 Flash-Lite, 9× to 5× for Gemini 3.8 Flash, and 23× to 11× for Gemini 4 Argon during its introductory period (standard: 46× to 23×). The reductions differ by model, not a uniform 50% discount.\n- Actual deductions still price input, output (including thinking), and cached tokens separately; the reference multiplier is not one flat rate for every token.\n- Voice-reply pricing has increased. Text input and generated audio are now charged separately, replacing the previous total-token rule.\n- In-app purchase prices are unchanged.";
const HYDROGEN_NOTES = "Features\n\n- Gemini 4 Hydrogen is now available as an optional chat model, with a server reference multiplier of 7×. Gemini 3.5 Flash-Lite remains the default model.\n- Gemini 4 Argon is no longer listed. If an older version still requests Argon, the service uses Flash-Lite instead.\n- Default thinking levels now follow each model's official defaults. Hydrogen defaults to high and also allows an extra-high option.\n- Carbon's introductory and standard pricing is unchanged. In-app purchase prices are unchanged.";

test('existing app-only history retains its input order and presentation', () => {
  const initial = {version: '1.0', date: '2020-01-01', platforms: ['iOS'], notes: ''};
  const rows = changelogEntries([initial, app]);
  assert.deepEqual(rows.map(r => r.version), ['1.0', '1.2.3']);
  assert.equal(entryLabel(rows[1]), '1.2.3');
  assert.equal(entryMeta(rows[1]), '2026-11-09 · iOS, macOS');
  assert.equal(entryNotes(rows[0]), 'Initial release.');
});
test('server updates are dated and labelled without inventing an app version or platform', () => {
  const rows = changelogEntries([app], [server]);
  assert.equal(rows[0].kind, 'server');
  assert.equal(rows[0].version, undefined);
  assert.equal(entryLabel(rows[0]), 'Server update');
  assert.equal(entryMeta(rows[0]), '2026-11-11');
  assert.equal(entryNotes(rows[0]), 'Service rollout');
  assert.equal(rows[1].kind, 'app');
});
test('an optional future verified server tag is clearly separate from an app version', () => {
  const rows = changelogEntries([app], [{...server, version: 'v1.2.3'}]);
  assert.equal(entryLabel(rows[0]), 'Server update · v1.2.3');
  assert.notEqual(rows[0].key, rows[1].key);
  assert.equal(entryNotes({...rows[0], version: '1.0', notes: ''}), '');
});
test('mixed history sorts newest first while retaining same-day stable app ordering', () => {
  const sameDay = {...app, version: '1.2.4', date: server.date};
  const rows = changelogEntries([sameDay, app], [{date: '2026-11-10', notes: 'Pricing'}, server]);
  assert.deepEqual(rows.map(r => [r.kind, r.date]), [['app', '2026-11-11'], ['server', '2026-11-11'], ['server', '2026-11-10'], ['app', '2026-11-09']]);
  assert.equal(newestFirst(server, server), 0);
  assert.equal(newestFirst({date: null}, server) > 0, true);
});
test('shared extras are inserted before the last shared bullet', () => {
  const entry = {notes: '- Common one\n- Closing', extras: {'hello-hero': '- Voice only'}};
  assert.equal(resolveServerNotes(entry, 'hello-hero'), '- Common one\n- Voice only\n- Closing');
  assert.equal(resolveServerNotes(entry, 'web-copilot'), '- Common one\n- Closing');
});
test('HH/WC app pages keep pre-migration Carbon and 11-10 wording after the shared-file move', () => {
  const shared = readJSON('docs/data/server-updates/shared.json');
  assert.deepEqual(shared.map(r => r.date), [...shared].sort(newestFirst).map(r => r.date));
  assert.deepEqual(shared.slice(-3).map(r => r.date), ['2026-11-13', '2026-11-11', '2026-11-10']);
  for (const slug of ['hello-hero', 'web-copilot']) {
    const rows = serverUpdatesForApp(shared, slug);
    assert.deepEqual(rows.slice(-3).map(r => r.date), ['2026-11-13', '2026-11-11', '2026-11-10']);
    const r1113 = rows.find(r => r.date === '2026-11-13');
    const r1111 = rows.find(r => r.date === '2026-11-11');
    const r1110 = rows.find(r => r.date === '2026-11-10');
    assert.equal(r1113.version, 'v0.1.4');
    assert.equal(r1111.version, 'v0.1.3');
    assert.equal(r1110.version, undefined);
    assert.equal(r1111.notes, CARBON_NOTES);
    assert.equal(r1110.notes, slug === 'hello-hero' ? HH_PRICING : PRICING_COMMON);
    assert.match(r1110.notes, /In-app purchase prices are unchanged/);
    assert.doesNotMatch(JSON.stringify(rows), /https?:|tencentscf|SCF|digest|live\d+|[0-9a-f]{40}|sales|requestId|installId/i);
    const apps = readJSON(`docs/data/changelogs/${slug}.json`);
    const combined = changelogEntries(apps, rows);
    assert.equal(combined.length, apps.length + rows.length);
    assert.equal(new Set(combined.map(r => r.key)).size, combined.length);
    assert.deepEqual(combined.filter(r => r.kind === 'app').map(({kind, key, ...r}) => r).sort((a,b) => a.version.localeCompare(b.version)), [...apps].sort((a,b) => a.version.localeCompare(b.version)));
  }
});
test('pricing notices distinguish model-specific discounts and disclose HH voice increases only', () => {
  const shared = readJSON('docs/data/server-updates/shared.json');
  const hh = serverUpdatesForApp(shared, 'hello-hero').find(r => r.date === '2026-11-10').notes;
  const wc = serverUpdatesForApp(shared, 'web-copilot').find(r => r.date === '2026-11-10').notes;
  for (const text of [hh, wc]) {
    for (const snippet of ['5× to 3×', '9× to 5×', '23× to 11×', '46× to 23×', 'not a uniform 50%', 'cached tokens separately']) assert.ok(text.includes(snippet));
  }
  assert.match(hh, /Voice-reply pricing has increased/);
  assert.match(hh, /Text input and generated audio are now charged separately/);
  assert.doesNotMatch(wc, /Voice-reply/);
  assert.ok(hh.indexOf('Voice-reply') < hh.indexOf('In-app purchase prices are unchanged'));
});
test('Carbon notice retains Argon/Lite, conditions client availability and gives the switch time zone', () => {
  const shared = readJSON('docs/data/server-updates/shared.json');
  for (const slug of ['hello-hero', 'web-copilot']) {
    const text = serverUpdatesForApp(shared, slug).find(r => r.date === '2026-11-11').notes;
    for (const snippet of ['Carbon', 'alongside Gemini 4 Argon', 'Flash-Lite remains the default', 'In app versions that support', 'after that list refreshes', 'Older versions may not show it', 'introductory reference 11× until December 1, 2026 at 08:00 China Standard Time (UTC+8)', 'then standard 23×']) assert.ok(text.includes(snippet));
  }
});
test('Hydrogen notice is a short 7× / Argon / official-thinking / unchanged-price entry', () => {
  const shared = readJSON('docs/data/server-updates/shared.json');
  for (const slug of ['hello-hero', 'web-copilot']) {
    const row = serverUpdatesForApp(shared, slug).find(r => r.date === '2026-11-13');
    assert.equal(row.version, 'v0.1.4');
    assert.equal(row.notes, HYDROGEN_NOTES);
    assert.match(row.notes, /^Features\n\n-/);
    assert.doesNotMatch(row.notes, /Improvements/);
    assert.equal(row.notes.split('\n').filter(l => l.startsWith('- ')).length, 4);
    assert.doesNotMatch(row.notes, /7\/18|profit|margin|SCF|hello-hero-prod|after that list refreshes|component-based|cached tokens/i);
  }
});
test('/updates lists each shared server row once and keeps per-app extras', () => {
  const shared = readJSON('docs/data/server-updates/shared.json');
  const files = {
    'hello-hero': readJSON('docs/data/changelogs/hello-hero.json'),
    'web-copilot': readJSON('docs/data/changelogs/web-copilot.json'),
  };
  const feed = updatesFeed(files, shared);
  const servers = feed.filter(r => r.kind === 'server');
  assert.deepEqual(servers.slice(-3).map(r => r.date), ['2026-11-13', '2026-11-11', '2026-11-10']);
  for (const row of servers) {
    assert.deepEqual(row.apps, ['hello-hero', 'web-copilot']);
    assert.equal(feed.filter(r => r.key === row.key).length, 1);
  }
  const priced = entryNotesWithExtras(servers.find(r => r.date === '2026-11-10'));
  assert.match(priced, /Voice-reply pricing has increased/);
  assert.match(priced, /Hello, Hero/);
  assert.match(priced, /^Features\n/m);
  assert.ok(priced.indexOf('Features') < priced.indexOf('Voice-reply'));
  assert.ok(priced.indexOf('Voice-reply') < priced.indexOf('In-app purchase prices are unchanged'));
  assert.doesNotMatch(entryNotesWithExtras(servers.find(r => r.date === '2026-11-13')), /Hello, Hero\n-/);
  assert.equal(APP_NAMES['hello-hero'], 'Hello, Hero');
});
test('server release upserts update shared.json idempotently and reject internal terms', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-server-update-test-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  for (const rel of ['scripts/merge-server-update.py', 'scripts/fetch-changelogs.py', 'docs/data/changelogs/hello-hero.json', 'docs/data/server-updates/shared.json']) {
    const dest = path.join(dir, rel); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(path.join(root, rel), dest);
  }
  const appPath = path.join(dir, 'docs/data/changelogs/hello-hero.json');
  const appBefore = fs.readFileSync(appPath);
  const servicePath = path.join(dir, 'docs/data/server-updates/shared.json');
  const payload = path.join(dir, 'server-fixture.json');

  fs.writeFileSync(payload, JSON.stringify({
    version: '0.1.5',
    date: '2026-11-19',
    apps: ['hello-hero', 'web-copilot'],
    notes: 'Features\n\n- Added Gemini 4 Neon.\n- In-app purchase prices are unchanged.',
    extras: {'hello-hero': '- Voice-reply reference rates updated.'}
  }));
  let r = spawnSync('python3', [path.join(dir, 'scripts/merge-server-update.py'), payload], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /server-update v0\.1\.5 \(2026-11-19\): added/);

  let rows = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
  assert.equal(rows.length, 4);
  assert.equal(rows[0].version, 'v0.1.5');
  assert.equal(rows[0].date, '2026-11-19');
  assert.deepEqual(rows[0].apps, ['hello-hero', 'web-copilot']);
  assert.equal(rows[0].extras['hello-hero'], '- Voice-reply reference rates updated.');

  // Upserting the same version updates in place without adding a duplicate row.
  fs.writeFileSync(payload, JSON.stringify({
    version: 'v0.1.5',
    date: '2026-11-19',
    apps: ['hello-hero', 'web-copilot'],
    notes: 'Features\n\n- Added Gemini 4 Neon (11×).\n- In-app purchase prices are unchanged.'
  }));
  r = spawnSync('python3', [path.join(dir, 'scripts/merge-server-update.py'), payload], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /server-update v0\.1\.5 \(2026-11-19\): updated/);
  rows = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
  assert.equal(rows.length, 4);
  assert.equal(rows[0].extras, undefined);
  assert.match(rows[0].notes, /11×/);

  // Forbidden internal terms are rejected before modifying shared.json.
  fs.writeFileSync(payload, JSON.stringify({
    version: 'v0.1.6',
    date: '2026-11-20',
    notes: 'Features\n\n- Deployed to SCF live2'
  }));
  r = spawnSync('python3', [path.join(dir, 'scripts/merge-server-update.py'), payload], {encoding:'utf8'});
  assert.notEqual(r.status, 0);
  assert.equal(JSON.parse(fs.readFileSync(servicePath, 'utf8')).length, 4);
  assert.deepEqual(fs.readFileSync(appPath), appBefore);
});
test('app release upserts preserve separate server history without any dispatch or network call', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-changelog-test-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  for (const rel of ['scripts/merge-changelog.py', 'scripts/fetch-changelogs.py', 'docs/data/changelogs/hello-hero.json', 'docs/data/server-updates/shared.json']) {
    const dest = path.join(dir, rel); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(path.join(root, rel), dest);
  }
  const servicePath = path.join(dir, 'docs/data/server-updates/shared.json');
  const before = fs.readFileSync(servicePath);
  const payload = path.join(dir, 'fixture.json');
  fs.writeFileSync(payload, JSON.stringify({slug:'hello-hero', version:'99.0.0', date:'2099-01-01', notes:'Features\n\n- Synthetic fixture only'}));
  const r = spawnSync('python3', [path.join(dir, 'scripts/merge-changelog.py'), payload], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(fs.readFileSync(servicePath), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'docs/data/changelogs/hello-hero.json')))[0].version, '99.0.0');
});
test('all current website language/config and both existing renderers include the shared server path', () => {
  const cfg = fs.readFileSync(path.join(root, 'docs/.vitepress/config.ts'), 'utf8');
  assert.match(cfg, /lang: 'en-US'/); assert.doesNotMatch(cfg, /locales\s*:/);
  for (const slug of ['hello-hero', 'web-copilot']) {
    const page = fs.readFileSync(path.join(root, `docs/apps/${slug}.md`), 'utf8');
    assert.ok(page.includes(`../data/server-updates/shared.json`));
    assert.ok(page.includes(':shared-items="sharedServerUpdates"'));
    assert.ok(page.includes(`app="${slug}"`));
    assert.ok(!page.includes(`server-updates/${slug}.json`));
  }
  for (const component of ['Changelog.vue','Updates.vue']) {
    const source = fs.readFileSync(path.join(root, 'docs/components', component), 'utf8');
    assert.ok(source.includes('changelog.js'));
  }
  assert.ok(fs.readFileSync(path.join(root, 'docs/components/Changelog.vue'), 'utf8').includes('serverUpdatesForApp'));
  assert.ok(fs.readFileSync(path.join(root, 'docs/components/Updates.vue'), 'utf8').includes('updatesFeed'));
  assert.ok(!fs.existsSync(path.join(root, 'docs/data/server-updates/hello-hero.json')));
  assert.ok(!fs.existsSync(path.join(root, 'docs/data/server-updates/web-copilot.json')));
});
