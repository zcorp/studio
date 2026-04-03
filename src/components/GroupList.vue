<template>
  <aside class="flex flex-col h-full bg-panel border-l border-border w-80 shrink-0">
    <!-- Header -->
    <div class="px-3 py-2.5 border-b border-border flex items-center justify-between shrink-0">
      <span class="font-display font-semibold text-[11px] uppercase tracking-widest text-dim">Groupes</span>
      <div class="flex items-center gap-1">
        <span class="timecode text-[10px]">{{ totalProfiles }} profils</span>
        <button
          class="btn-ghost text-[10px] px-2 py-0.5 ml-1"
          :class="profileStore.selectedIds.size > 0 ? 'text-accent' : 'text-dim'"
          @click="profileStore.clearSelection()"
          v-if="profileStore.selectedIds.size > 0"
        >
          ✕ {{ profileStore.selectedIds.size }} sél.
        </button>
      </div>
    </div>

    <!-- No work selected -->
    <div v-if="!workStore.selectedWorkId" class="flex-1 flex items-center justify-center">
      <p class="text-xs text-dim/50 text-center px-4">Chargez une œuvre pour voir les groupes</p>
    </div>

    <!-- Loading -->
    <div v-else-if="groupStore.loading" class="flex-1 flex items-center justify-center">
      <div class="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin"/>
    </div>

    <div v-else class="flex-1 overflow-y-auto p-2 space-y-2">
      <!-- Validated group (always first, fixed) -->
      <GroupColumn
        v-if="groupStore.validatedGroup"
        :group="groupStore.validatedGroup"
        :validation-mode="props.validationMode"
      />

      <!-- Dynamic groups (reorderable) -->
      <draggable
        v-model="dynamicGroupsLocal"
        item-key="id"
        handle=".drag-handle"
        ghost-class="opacity-30"
        :animation="150"
        class="space-y-2"
        @end="onReorderGroups"
      >
        <template #item="{ element: group }">
          <div class="relative">
            <!-- Drag handle -->
            <div class="drag-handle absolute left-1.5 top-3 cursor-grab z-10 text-dim/30 hover:text-dim transition-colors">
              <svg class="w-3 h-3" viewBox="0 0 12 16" fill="currentColor">
                <circle cx="4" cy="4" r="1.2"/><circle cx="8" cy="4" r="1.2"/>
                <circle cx="4" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/>
                <circle cx="4" cy="12" r="1.2"/><circle cx="8" cy="12" r="1.2"/>
              </svg>
            </div>
            <GroupColumn :group="group" :validation-mode="props.validationMode" class="pl-2"/>
          </div>
        </template>
      </draggable>

      <!-- Default group (always last, fixed) -->
      <GroupColumn
        v-if="groupStore.defaultGroup"
        :group="groupStore.defaultGroup"
        :validation-mode="props.validationMode"
      />

      <!-- Add group button -->
      <button
        class="w-full border border-dashed border-border/50 rounded py-2.5 text-xs text-dim/50 hover:border-accent/40 hover:text-accent/70 transition-all flex items-center justify-center gap-1.5"
        @click="createGroup"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 1v10M1 6h10" stroke-linecap="round"/>
        </svg>
        Nouveau groupe
      </button>
    </div>

    <!-- Compare panel -->
    <transition name="slide-up">
      <div
        v-if="profileStore.compareIds.length === 2"
        class="border-t border-border bg-surface p-3 shrink-0"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-[10px] font-mono uppercase tracking-widest text-dim">Comparaison</span>
          <button class="btn-ghost text-[10px] px-1" @click="profileStore.clearCompare()">✕</button>
        </div>
        <div class="flex gap-2">
          <div
            v-for="id in profileStore.compareIds"
            :key="id"
            class="flex-1 text-center"
          >
            <template v-if="profileStore.byId[id]">
              <img
                :src="profileStore.byId[id].faceUrl"
                class="w-16 h-16 rounded object-cover mx-auto border border-border"
              />
              <div class="text-[10px] mt-1 text-text truncate">
                {{ profileStore.byId[id].suggestedName || 'Sans nom' }}
              </div>
              <div class="timecode text-[9px]">
                {{ formatTime(profileStore.byId[id].timestamp) }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import GroupColumn from './GroupColumn.vue'
import { useWorkStore } from '@/stores/useWorkStore'
import { useGroupStore } from '@/stores/useGroupStore'
import { useProfileStore } from '@/stores/useProfileStore'

const props = defineProps({ validationMode: Boolean })

const workStore = useWorkStore()
const groupStore = useGroupStore()
const profileStore = useProfileStore()

// Local copy for draggable reordering of dynamic groups
const dynamicGroupsLocal = ref([...groupStore.dynamicGroups])

watch(() => groupStore.dynamicGroups, (g) => {
  dynamicGroupsLocal.value = [...g]
}, { deep: true })

const totalProfiles = computed(() =>
  groupStore.groups.reduce((sum, g) => sum + g.profileIds.length, 0)
)

async function createGroup() {
  await groupStore.createGroup(workStore.selectedWorkId)
}

function onReorderGroups() {
  groupStore.reorderDynamicGroups(dynamicGroupsLocal.value)
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}
</script>
