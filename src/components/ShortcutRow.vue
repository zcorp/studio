<template>
  <div class="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
    <span class="text-xs text-dim">{{ label }}</span>
    <div class="flex items-center gap-1">
      <kbd
        v-for="k in keyList"
        :key="k"
        class="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-elevated text-subtle"
      >{{ k }}</kbd>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  keys: String,
  label: String,
})

const keyList = computed(() => props.keys.split(' / '))
</script>
