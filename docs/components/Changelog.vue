<script setup lang="ts">
const props = defineProps<{ items: { version: string; date: string; platforms: string[]; notes: string }[]; limit?: number }>();
const max = props.limit ?? 10;
const recent = props.items.slice(0, max);
const older = props.items.slice(max);
const text = (e: any) => e.notes || (e.version === '1.0' ? 'Initial release.' : '');
</script>

<template>
  <div class="changelog">
    <div v-for="e in recent" :key="e.version" class="cl-entry">
      <div class="cl-head"><strong>{{ e.version }}</strong><span>{{ e.date }} · {{ e.platforms.join(', ') }}</span></div>
      <div v-if="text(e)" class="cl-notes">{{ text(e) }}</div>
    </div>
    <details v-if="older.length" class="cl-older">
      <summary>Older versions ({{ older.length }})</summary>
      <div v-for="e in older" :key="e.version" class="cl-entry">
        <div class="cl-head"><strong>{{ e.version }}</strong><span>{{ e.date }} · {{ e.platforms.join(', ') }}</span></div>
        <div v-if="text(e)" class="cl-notes">{{ text(e) }}</div>
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
