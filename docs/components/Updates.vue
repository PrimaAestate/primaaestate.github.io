<script setup lang="ts">
import { ref, computed } from 'vue';
import sharedServerUpdates from '../data/server-updates/shared.json';
import { updatesFeed, APP_NAMES, entryLabel, entryMeta, entryNotes, entryNotesWithExtras } from './changelog.js';

const files = import.meta.glob('../data/changelogs/*.json', { eager: true, import: 'default' }) as Record<string, any[]>;
const changelogFiles = Object.fromEntries(
  Object.entries(files).map(([p, rows]) => [p.split('/').pop()!.replace('.json', ''), rows]),
);
const all = updatesFeed(changelogFiles, sharedServerUpdates as any[]);
const shown = ref(30);
const items = computed(() => all.slice(0, shown.value));
const nameOf = (slug: string) => APP_NAMES[slug] || slug;
</script>

<template>
  <div class="updates">
    <div v-for="e in items" :key="(e.slug || 'server') + e.key" class="up-entry">
      <div class="up-apps">
        <a v-for="slug in e.apps" :key="slug" :href="`/apps/${slug}`" class="up-app">
          <img :src="`/img/apps/${slug}/icon.png`" :alt="nameOf(slug)" />
        </a>
      </div>
      <div class="up-body">
        <div class="up-head">
          <template v-if="e.kind === 'server'">
            <a v-for="slug in e.apps" :key="slug" :href="`/apps/${slug}`"><strong>{{ nameOf(slug) }}</strong></a>
          </template>
          <a v-else :href="`/apps/${e.slug}`"><strong>{{ e.name }}</strong></a>
          <span class="up-ver">{{ entryLabel(e) }}</span>
          <span class="up-meta">{{ entryMeta(e) }}</span>
        </div>
        <div v-if="e.kind === 'server' ? entryNotesWithExtras(e) : entryNotes(e)" class="up-notes">{{ e.kind === 'server' ? entryNotesWithExtras(e) : entryNotes(e) }}</div>
      </div>
    </div>
    <button v-if="shown < all.length" class="up-more" @click="shown += 30">
      Load more ({{ all.length - shown }} older)
    </button>
  </div>
</template>

<style scoped>
.up-entry { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--vp-c-divider); }
.up-apps { display: flex; flex-direction: column; gap: 6px; flex: 0 0 auto; width: 48px; }
.up-app img { width: 48px; height: 48px; border-radius: 11px; display: block; }
.up-body { flex: 1; min-width: 0; }
.up-head { display: flex; flex-wrap: wrap; gap: 8px 10px; align-items: baseline; }
.up-head a { text-decoration: none; color: inherit; }
.up-ver { font-weight: 600; color: var(--vp-c-brand-1); }
.up-meta { font-size: 13px; color: var(--vp-c-text-2); }
.up-notes { white-space: pre-line; font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); margin-top: 4px; }
.up-more { margin: 20px auto; display: block; padding: 8px 18px; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
.up-more:hover { border-color: var(--vp-c-brand-1); }
</style>
