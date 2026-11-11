import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { changelogEntries, newestFirst, entryLabel, entryMeta, entryNotes } from '../docs/components/changelog.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const readJSON = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const app = {version: '1.2.3', date: '2026-11-09', platforms: ['iOS', 'macOS'], notes: 'App release'};
const server = {date: '2026-11-11', notes: 'Service rollout'};

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
test('HH/WC retain approved dates with a verified tag only for the Carbon rollout', () => {
  for (const slug of ['hello-hero', 'web-copilot']) {
    const apps = readJSON(`docs/data/changelogs/${slug}.json`);
    const services = readJSON(`docs/data/server-updates/${slug}.json`);
    assert.deepEqual(services.map(r => r.date), ['2026-11-11', '2026-11-10']);
    for (const row of services) {
      assert.deepEqual(Object.keys(row).sort(), row.date === '2026-11-11' ? ['date', 'notes', 'version'] : ['date', 'notes']);
      assert.equal(row.version, row.date === '2026-11-11' ? 'v0.1.3' : undefined);
      assert.match(row.notes, /In-app purchase prices are unchanged/);
      assert.doesNotMatch(row.notes, /https?:|tencentscf|SCF|digest|live\d+|[0-9a-f]{40}|sales|requestId|installId/i);
    }
    const rows = changelogEntries(apps, services);
    assert.equal(rows.length, apps.length + 2);
    assert.equal(new Set(rows.map(r => r.key)).size, rows.length);
    assert.deepEqual(rows.filter(r => r.kind === 'app').map(({kind, key, ...r}) => r).sort((a,b) => a.version.localeCompare(b.version)), [...apps].sort((a,b) => a.version.localeCompare(b.version)));
  }
});
test('pricing notices distinguish model-specific discounts and disclose HH voice increases only', () => {
  const hh = readJSON('docs/data/server-updates/hello-hero.json')[1].notes;
  const wc = readJSON('docs/data/server-updates/web-copilot.json')[1].notes;
  for (const text of [hh, wc]) {
    for (const snippet of ['5× to 3×', '9× to 5×', '23× to 11×', '46× to 23×', 'not a uniform 50%', 'cached tokens separately']) assert.ok(text.includes(snippet));
  }
  assert.match(hh, /Voice-reply pricing has increased/);
  assert.match(hh, /Text input and generated audio are now charged separately/);
  assert.doesNotMatch(wc, /Voice-reply/);
});
test('Carbon notice retains Argon/Lite, conditions client availability and gives the switch time zone', () => {
  for (const slug of ['hello-hero', 'web-copilot']) {
    const text = readJSON(`docs/data/server-updates/${slug}.json`)[0].notes;
    for (const snippet of ['Carbon', 'alongside Gemini 4 Argon', 'Flash-Lite remains the default', 'In app versions that support', 'after that list refreshes', 'Older versions may not show it', 'introductory reference 11× until December 1, 2026 at 08:00 China Standard Time (UTC+8)', 'then standard 23×']) assert.ok(text.includes(snippet));
  }
});
test('app release upserts preserve separate server history without any dispatch or network call', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-changelog-test-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  for (const rel of ['scripts/merge-changelog.py', 'scripts/fetch-changelogs.py', 'docs/data/changelogs/hello-hero.json', 'docs/data/server-updates/hello-hero.json']) {
    const dest = path.join(dir, rel); fs.mkdirSync(path.dirname(dest), {recursive:true}); fs.copyFileSync(path.join(root, rel), dest);
  }
  const servicePath = path.join(dir, 'docs/data/server-updates/hello-hero.json');
  const before = fs.readFileSync(servicePath);
  const payload = path.join(dir, 'fixture.json');
  fs.writeFileSync(payload, JSON.stringify({slug:'hello-hero', version:'99.0.0', date:'2099-01-01', notes:'Features\n\n- Synthetic fixture only'}));
  const r = spawnSync('python3', [path.join(dir, 'scripts/merge-changelog.py'), payload], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(fs.readFileSync(servicePath), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'docs/data/changelogs/hello-hero.json')))[0].version, '99.0.0');
});
test('all current website language/config and both existing renderers include the server path', () => {
  const cfg = fs.readFileSync(path.join(root, 'docs/.vitepress/config.ts'), 'utf8');
  assert.match(cfg, /lang: 'en-US'/); assert.doesNotMatch(cfg, /locales\s*:/);
  for (const slug of ['hello-hero', 'web-copilot']) {
    const page = fs.readFileSync(path.join(root, `docs/apps/${slug}.md`), 'utf8');
    assert.ok(page.includes(`../data/server-updates/${slug}.json`));
    assert.ok(page.includes(':server-items="serverUpdates"'));
  }
  for (const component of ['Changelog.vue','Updates.vue']) {
    const source = fs.readFileSync(path.join(root, 'docs/components', component), 'utf8');
    assert.ok(source.includes('changelogEntries')); assert.ok(source.includes('entryLabel(e)'));
  }
});
