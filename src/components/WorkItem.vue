<template>
  <button
    class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all duration-150 text-left group"
    :class="selected
      ? 'bg-accent/10 border border-accent/30 text-text'
      : 'hover:bg-elevated border border-transparent text-dim hover:text-text'"
    @click="$emit('click', work)"
  >
    <!-- Thumbnail -->
    <div class="w-8 h-11 rounded overflow-hidden shrink-0 bg-muted/30">
      <img
        v-if="work.thumbnail"
        :src="work.thumbnail"
        :alt="work.title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <div class="text-xs font-medium truncate leading-tight" :class="selected ? 'text-bright' : ''">
        {{ work.title }}
      </div>
      <div class="text-[10px] font-mono text-dim/70 mt-0.5">{{ work.year }}</div>
    </div>

    <!-- Serie expand arrow -->
    <svg
      v-if="work.type === 'serie'"
      class="w-3 h-3 text-dim shrink-0 transition-transform duration-200"
      :class="expanded ? 'rotate-90' : ''"
      viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5"
    >
      <path d="M2 2l4 4-4 4"/>
    </svg>

    <!-- Selected indicator -->
    <div v-else-if="selected" class="w-1 h-4 rounded bg-accent shrink-0"/>
  </button>
</template>

<script setup>
defineProps({
  work: { type: Object, required: true },
  selected: Boolean,
  expanded: Boolean,
})
defineEmits(['click'])
</script>
