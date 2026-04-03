<template>
  <div v-if="texts.length" class="px-2 py-1.5 border-t border-border/40 space-y-0.5">
    <div class="text-[9px] font-mono uppercase tracking-widest text-dim/50 mb-1">Textes détectés</div>
    <div
      v-for="(t, i) in texts"
      :key="i"
      class="text-[10px] font-mono text-text/70 bg-void/50 rounded px-1.5 py-0.5 truncate"
      :title="t"
    >
      {{ t }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  texts: { type: Array, default: () => [] },
})
</script>
