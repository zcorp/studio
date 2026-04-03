<template>
  <div
    class="rounded border transition-all duration-200"
    :class="[
      isFocused
        ? 'border-accent/40 bg-accent/3'
        : 'border-border bg-panel',
      isDropTarget ? 'border-accent/60 bg-accent/5' : '',
    ]"
  >
    <!-- Group header -->
    <div class="flex items-center gap-2 px-2.5 py-2 border-b border-border/60">
      <!-- Color dot -->
      <div class="w-2 h-2 rounded-full shrink-0" :class="dotClass"/>

      <!-- Name (editable) -->
      <div class="flex-1 min-w-0">
        <input
          v-if="editingName"
          ref="nameInputRef"
          v-model="localName"
          class="input-dark text-xs w-full py-0.5"
          @blur="saveName"
          @keydown.enter="saveName"
          @keydown.escape="editingName = false"
        />
        <button
          v-else
          class="text-xs font-medium text-text hover:text-bright text-left truncate w-full"
          :class="group.type === 'validated' ? 'text-validated' : group.type === 'default' ? 'text-dim' : ''"
          @dblclick="startEditName"
        >
          {{ group.name }}
        </button>
      </div>

      <!-- Profile count -->
      <span class="timecode text-[10px] shrink-0">{{ profileIds.length }}</span>

      <!-- Actions -->
      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Focus toggle -->
        <button class="btn-ghost px-1 py-0.5" :class="{ 'text-accent': isFocused }" @click="groupStore.setFocus(group.id)" title="Isoler ce groupe">
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="6" cy="6" r="4"/>
            <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          </svg>
        </button>

        <!-- Select all -->
        <button class="btn-ghost px-1 py-0.5" @click="selectAll" title="Tout sélectionner">
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="1" width="4" height="4" rx="0.5"/>
            <rect x="7" y="1" width="4" height="4" rx="0.5"/>
            <rect x="1" y="7" width="4" height="4" rx="0.5"/>
            <rect x="7" y="7" width="4" height="4" rx="0.5"/>
          </svg>
        </button>

        <!-- Move selected here -->
        <button
          v-if="profileStore.selectedIds.size > 0"
          class="btn-ghost px-1 py-0.5 text-accent"
          @click="moveSelectedHere"
          title="Déplacer la sélection ici"
        >
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 6h8M7 3l3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Delete (dynamic only) -->
        <button
          v-if="!group.fixed"
          class="btn-ghost px-1 py-0.5 text-dim hover:text-rejected"
          @click="confirmDelete"
          title="Supprimer le groupe"
        >
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 3h8M5 3V2h2v1M4.5 9.5l-.5-5M7.5 9.5l.5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Profiles drag-and-drop grid -->
    <div class="p-2">
      <draggable
        v-model="localProfileIds"
        group="profiles"
        item-key="id"
        class="grid grid-cols-3 gap-1.5 min-h-[40px]"
        ghost-class="sortable-ghost"
        drag-class="sortable-drag"
        :animation="150"
        @change="onDragChange"
        @dragenter="isDropTarget = true"
        @dragleave="isDropTarget = false"
        @drop="isDropTarget = false"
      >
        <template #item="{ element: profileId }">
          <ProfileCard
            :profile="profileStore.byId[profileId]"
            v-if="profileStore.byId[profileId]"
          />
        </template>
        <template #footer>
          <div
            v-if="localProfileIds.length === 0"
            class="col-span-3 flex items-center justify-center h-10 text-[10px] text-dim/40 font-mono border border-dashed border-border/30 rounded"
          >
            Vide — glissez des profils ici
          </div>
        </template>
      </draggable>

      <!-- "Move to" dropdown (alternative to drag) -->
      <div v-if="profileStore.selectedIds.size > 0 && hasSelectedInGroup" class="mt-2 pt-2 border-t border-border/40 flex items-center gap-2">
        <span class="text-[10px] text-dim">Déplacer vers :</span>
        <select
          class="input-dark text-[10px] py-0.5 flex-1"
          @change="moveTo($event.target.value)"
        >
          <option value="">— choisir —</option>
          <option v-for="g in otherGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </div>
    </div>

    <!-- Validation rapide overlay (when in validation mode) -->
    <div v-if="validationMode && profileIds.length > 0 && group.type !== 'validated'" class="px-2 pb-2 flex gap-1.5">
      <button class="btn-success flex-1 text-xs justify-center" @click="validateAll">
        <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Valider tout
      </button>
      <button class="btn-danger flex-1 text-xs justify-center" @click="rejectAll">
        <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l6 6M9 3l-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Rejeter tout
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import draggable from 'vuedraggable'
import ProfileCard from './ProfileCard.vue'
import { useGroupStore } from '@/stores/useGroupStore'
import { useProfileStore } from '@/stores/useProfileStore'

const props = defineProps({
  group: { type: Object, required: true },
  validationMode: Boolean,
})

const groupStore = useGroupStore()
const profileStore = useProfileStore()

const editingName = ref(false)
const localName = ref(props.group.name)
const nameInputRef = ref(null)
const isDropTarget = ref(false)

// Local copy of profile IDs for draggable
const localProfileIds = ref([...props.group.profileIds])

// Keep in sync with store
watch(() => props.group.profileIds, (ids) => {
  localProfileIds.value = [...ids]
}, { deep: true })

const profileIds = computed(() => props.group.profileIds)

const isFocused = computed(() =>
  groupStore.focusedGroupId === props.group.id
)

const hasSelectedInGroup = computed(() =>
  props.group.profileIds.some(id => profileStore.selectedIds.has(id))
)

const otherGroups = computed(() =>
  groupStore.groups.filter(g => g.id !== props.group.id)
)

const dotClass = computed(() => {
  if (props.group.type === 'validated') return 'bg-validated shadow-glow-validated'
  if (props.group.type === 'default') return 'bg-dim'
  return 'bg-accent'
})

function onDragChange(event) {
  // When element added to this group via drag
  if (event.added) {
    const profileId = event.added.element
    groupStore.moveProfiles([profileId], props.group.id)
  }
  // Reorder within group
  if (event.moved) {
    groupStore.reorderProfilesInGroup(props.group.id, localProfileIds.value)
  }
}

function selectAll() {
  profileStore.selectAll(props.group.profileIds)
}

function moveSelectedHere() {
  const ids = [...profileStore.selectedIds]
  groupStore.moveProfiles(ids, props.group.id)
  profileStore.clearSelection()
}

function moveTo(targetGroupId) {
  if (!targetGroupId) return
  const ids = props.group.profileIds.filter(id => profileStore.selectedIds.has(id))
  if (ids.length > 0) {
    groupStore.moveProfiles(ids, targetGroupId)
    profileStore.clearSelection()
  }
}

function validateAll() {
  groupStore.moveProfiles([...props.group.profileIds], groupStore.validatedGroup.id)
}

function rejectAll() {
  groupStore.moveProfiles([...props.group.profileIds], groupStore.defaultGroup.id)
}

async function confirmDelete() {
  if (!confirm(`Supprimer "${props.group.name}" ? Les profils seront déplacés vers le groupe par défaut.`)) return
  groupStore.deleteGroup(props.group.id)
}

function startEditName() {
  if (props.group.fixed) return
  localName.value = props.group.name
  editingName.value = true
  nextTick(() => nameInputRef.value?.focus())
}

function saveName() {
  if (localName.value.trim()) {
    groupStore.renameGroup(props.group.id, localName.value.trim())
  }
  editingName.value = false
}
</script>
