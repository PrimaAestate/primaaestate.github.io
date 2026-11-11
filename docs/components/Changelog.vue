<script setup lang="ts">
import { changelogEntries, entryLabel, entryMeta, entryNotes } from './changelog.js';
const props = defineProps<{ items: { version: string; date: string; platforms: string[]; notes: string }[]; serverItems?: { date: string; notes: string; version?: string }[]; limit?: number }>();
const entries = changelogEntries(props.items, props.serverItems);
const max = props.limit ?? 10;
const recent = entries.slice(0, max);
const older = entries.slice(max);

</script>

<template>
  <div class="changelog">
    <div v-for="e in recent" :key="e.key" class="cl-entry">
      <div class="cl-head"><strong>{{ entryLabel(e) }}</strong><span>{{ entryMeta(e) }}</span></div>
      <div v-if="entryNotes(e)" class="cl-notes">{{ entryNotes(e) }}</div>
    </div>
    <details v-if="older.length" class="cl-older">
      <summary>{{ props.serverItems?.length ? 'Older updates' : 'Older versions' }} ({{ older.length }})</summary>
      <div v-for="e in older" :key="e.key" class="cl-entry">
        <div class="cl-head"><strong>{{ entryLabel(e) }}</strong><span>{{ entryMeta(e) }}</span></div>
        <div v-if="entryNotes(e)" class="cl-notes">{{ entryNotes(e) }}</div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.cl-entry { border-left: 2px solid var(--vp-c-divider); padding: 4px 0 12px 16px; margin-bottom: 8px; }
.cl-head { display: flex; gap: 12px; align-items: baseline; }
.cl-head span { font-size: 13px; color: var(--vp-c-text-2); }
.cl-notes { white-space: pre-line; font-size: 14px; color: var(--vp-c-text-2); margin-top: 4px; line-height: 1.6; }
.cl-older summary { cursor: pointer; margin: 8px 0 12px; color: var(--vp-c-brand-1); }
</style>
