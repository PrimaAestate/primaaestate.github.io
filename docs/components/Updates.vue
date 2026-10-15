<script setup lang="ts">
import { ref, computed } from 'vue';

const NAMES: Record<string, string> = {
  aestate: 'Aestate', nomedia: 'NoMedia', 'web-copilot': 'Web Copilot', 'hello-hero': 'Hello, Hero',
  'console-mini': 'Console Mini', 'url-editor-portable': 'URL Editor Portable', 'json-tree': 'JSON Tree',
  'cashier-desk': 'Cashier Desk',
};
const files = import.meta.glob('../data/changelogs/*.json', { eager: true, import: 'default' }) as Record<string, any[]>;
const all = Object.entries(files)
  .flatMap(([p, rows]) => {
    const slug = p.split('/').pop()!.replace('.json', '');
    return rows.map((r) => ({ ...r, slug, name: NAMES[slug] || slug }));
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const shown = ref(30);
const items = computed(() => all.slice(0, shown.value));
const text = (e: any) => e.notes || (e.version === '1.0' ? 'Initial release.' : '');
</script>

<template>
  <div class="updates">
    <div v-for="e in items" :key="e.slug + e.version" class="up-entry">
      <a :href="`/apps/${e.slug}`" class="up-app">
        <img :src="`/img/apps/${e.slug}/icon.png`" :alt="e.name" />
      </a>
      <div class="up-body">
        <div class="up-head">
          <a :href="`/apps/${e.slug}`"><strong>{{ e.name }}</strong></a>
          <span class="up-ver">{{ e.version }}</span>
          <span class="up-meta">{{ e.date }} · {{ e.platforms.join(', ') }}</span>
        </div>
        <div v-if="text(e)" class="up-notes">{{ text(e) }}</div>
      </div>
    </div>
    <button v-if="shown < all.length" class="up-more" @click="shown += 30">
      Load more ({{ all.length - shown }} older)
    </button>
  </div>
</template>

<style scoped>
.up-entry { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--vp-c-divider); }
.up-app img { width: 48px; height: 48px; border-radius: 11px; }
.up-body { flex: 1; min-width: 0; }
.up-head { display: flex; flex-wrap: wrap; gap: 8px 10px; align-items: baseline; }
.up-head a { text-decoration: none; color: inherit; }
.up-ver { font-weight: 600; color: var(--vp-c-brand-1); }
.up-meta { font-size: 13px; color: var(--vp-c-text-2); }
.up-notes { white-space: pre-line; font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); margin-top: 4px; }
.up-more { margin: 20px auto; display: block; padding: 8px 18px; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
.up-more:hover { border-color: var(--vp-c-brand-1); }
</style>
