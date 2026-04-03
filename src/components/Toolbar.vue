<template>
  <header class="h-10 bg-surface border-b border-border flex items-center px-3 gap-3 shrink-0 z-50">
    <!-- Logo / Brand -->
    <div class="flex items-center gap-2 pr-3 border-r border-border">
      <div class="w-5 h-5 rounded bg-accent flex items-center justify-center">
        <svg class="w-3 h-3 text-void" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="4" cy="4" r="2.5"/>
          <circle cx="8" cy="8" r="2.5"/>
        </svg>
      </div>
      <span class="font-display font-700 text-xs tracking-widest text-bright uppercase">FaceGroup</span>
    </div>

    <!-- Work info -->
    <div class="flex items-center gap-2 text-xs text-dim font-mono flex-1 min-w-0">
      <span v-if="workStore.selectedWork" class="text-text truncate">
        {{ workStore.selectedWork.title }}
        <span v-if="episodeLabel" class="text-dim"> / {{ episodeLabel }}</span>
      </span>
      <span v-else class="text-dim italic">Aucune œuvre sélectionnée</span>
    </div>

    <!-- Undo / Redo -->
    <div class="flex items-center gap-1">
      <button
        class="btn-ghost px-2 py-1 text-xs"
        :class="{ 'opacity-30 pointer-events-none': !groupStore.canUndo }"
        @click="groupStore.undo()"
        title="Annuler (Ctrl+Z)"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 7L1 5l2-2M1 5h8a5 5 0 010 10H5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="btn-ghost px-2 py-1 text-xs"
        :class="{ 'opacity-30 pointer-events-none': !groupStore.canRedo }"
        @click="groupStore.redo()"
        title="Rétablir (Ctrl+Y)"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M13 7l2-2-2-2M15 5H7a5 5 0 000 10h4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div class="w-px h-4 bg-border"/>

    <!-- Validation mode toggle -->
    <button
      class="btn text-xs gap-1.5 px-3 py-1"
      :class="validationMode ? 'btn-accent' : 'btn-ghost'"
      @click="$emit('toggle-validation')"
      title="Mode validation rapide (V)"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M2 8l4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Validation
    </button>

    <!-- Compare mode -->
    <button
      class="btn-ghost text-xs gap-1.5 px-2 py-1"
      :class="{ 'text-info': profileStore.compareIds.length > 0 }"
      @click="profileStore.clearCompare()"
      title="Comparaison côte-à-côte"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="1" y="3" width="6" height="10" rx="1"/>
        <rect x="9" y="3" width="6" height="10" rx="1"/>
      </svg>
      {{ profileStore.compareIds.length > 0 ? `Comparer (${profileStore.compareIds.length})` : 'Comparer' }}
    </button>

    <div class="w-px h-4 bg-border"/>

    <!-- Keyboard shortcuts hint -->
    <button class="btn-ghost text-xs px-2 py-1 text-dim" @click="$emit('show-shortcuts')" title="Raccourcis clavier">
      <kbd class="font-mono text-[10px] px-1 py-0.5 rounded border border-border bg-elevated">?</kbd>
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkStore } from '@/stores/useWorkStore'
import { useGroupStore } from '@/stores/useGroupStore'
import { useProfileStore } from '@/stores/useProfileStore'

defineProps({ validationMode: Boolean })
defineEmits(['toggle-validation', 'show-shortcuts'])

const workStore = useWorkStore()
const groupStore = useGroupStore()
const profileStore = useProfileStore()

const episodeLabel = computed(() => {
  const work = workStore.selectedWork
  if (!work || work.type !== 'serie') return null
  const ep = work.episodes?.find(e => e.id === workStore.selectedEpisodeId)
  return ep ? `E${ep.number} — ${ep.title}` : null
})
</script>
