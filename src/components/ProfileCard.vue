<template>
  <div
    class="relative rounded border transition-all duration-150 cursor-pointer select-none group"
    :class="[
      selected
        ? 'border-accent/70 bg-accent/5 shadow-glow-accent'
        : 'border-border bg-elevated hover:border-muted',
      inCompare ? 'ring-1 ring-info/50' : '',
    ]"
    @click.exact="onClickExact"
    @click.ctrl="onClickMulti"
    @click.meta="onClickMulti"
  >
    <!-- Face image -->
    <div class="relative">
      <img
        :src="profile.faceUrl"
        :alt="profile.suggestedName || profile.id"
        class="w-full aspect-square object-cover rounded-t"
        loading="lazy"
        draggable="false"
      />

      <!-- Tag badge -->
      <div class="absolute top-1 left-1">
        <span :class="tagClass">{{ tagLabel }}</span>
      </div>

      <!-- Confidence dot -->
      <div
        class="absolute top-1 right-1 w-2 h-2 rounded-full border border-black/30"
        :class="confidenceDotClass"
        :title="`Confiance: ${Math.round(profile.confidence * 100)}%`"
      />

      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-t flex items-center justify-center gap-1.5">
        <!-- Jump to video -->
        <button
          class="w-6 h-6 rounded bg-surface/80 flex items-center justify-center hover:bg-accent hover:text-void transition-colors"
          title="Aller au timestamp"
          @click.stop="jumpToTimestamp"
        >
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><polygon points="3,1 10,6 3,11"/></svg>
        </button>
        <!-- Add to compare -->
        <button
          class="w-6 h-6 rounded bg-surface/80 flex items-center justify-center hover:bg-info hover:text-white transition-colors"
          title="Comparer"
          @click.stop="addToCompare"
        >
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="2" width="4" height="8" rx="0.5"/>
            <rect x="7" y="2" width="4" height="8" rx="0.5"/>
          </svg>
        </button>
      </div>

      <!-- Selected checkmark -->
      <div
        v-if="selected"
        class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center"
      >
        <svg class="w-2.5 h-2.5 text-void" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- Info footer -->
    <div class="px-1.5 py-1.5">
      <!-- Name (editable on double-click) -->
      <div v-if="!editing" class="text-[11px] font-medium truncate leading-tight" @dblclick.stop="startEdit">
        <span v-if="profile.suggestedName" class="text-text">{{ profile.suggestedName }}</span>
        <span v-else class="text-dim italic">Sans nom</span>
      </div>
      <input
        v-else
        ref="inputRef"
        v-model="editName"
        class="input-dark w-full text-[11px] py-0 px-1"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        @click.stop
      />

      <!-- Timestamp -->
      <div class="timecode text-[10px] mt-0.5">
        {{ formatTime(profile.timestamp) }}
      </div>

      <!-- Texts indicator -->
      <div v-if="profile.texts.length" class="mt-1 flex flex-wrap gap-0.5">
        <span
          v-for="t in profile.texts.slice(0, 2)"
          :key="t"
          class="text-[9px] font-mono text-dim/70 bg-void/60 px-1 py-0.5 rounded truncate max-w-full"
          :title="t"
        >{{ t }}</span>
      </div>
    </div>

    <!-- Tag quick-change (right-click simulation via button) -->
    <div class="absolute bottom-0 left-0 right-0 px-1.5 pb-1 hidden group-hover:flex gap-1 justify-center">
      <button
        v-for="t in TAGS"
        :key="t.value"
        class="flex-1 text-[8px] font-mono py-0.5 rounded border transition-colors"
        :class="profile.tag === t.value
          ? t.activeClass
          : 'border-border/40 text-dim/50 hover:border-muted hover:text-dim'"
        @click.stop="setTag(t.value)"
        :title="t.label"
      >{{ t.short }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useProfileStore } from '@/stores/useProfileStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

const props = defineProps({
  profile: { type: Object, required: true },
})

const profileStore = useProfileStore()
const playerStore = usePlayerStore()

const editing = ref(false)
const editName = ref('')
const inputRef = ref(null)

const TAGS = [
  { value: 'principal', label: 'Principal', short: 'Prin', activeClass: 'border-info/50 text-info bg-info/10' },
  { value: 'figurant', label: 'Figurant', short: 'Fig', activeClass: 'border-muted text-dim bg-muted/20' },
  { value: 'uncertain', label: 'Incertain', short: 'Inc', activeClass: 'border-uncertain/50 text-uncertain bg-uncertain/10' },
]

const selected = computed(() => profileStore.isSelected(props.profile.id))
const inCompare = computed(() => profileStore.compareIds.includes(props.profile.id))

const tagClass = computed(() => {
  const map = {
    principal: 'tag-principal',
    figurant: 'tag-figurant',
    uncertain: 'tag-uncertain',
  }
  return map[props.profile.tag] || 'tag-figurant'
})

const tagLabel = computed(() => {
  const map = { principal: 'P', figurant: 'F', uncertain: '?' }
  return map[props.profile.tag] || 'F'
})

const confidenceDotClass = computed(() => {
  const c = props.profile.confidence
  if (c >= 0.8) return 'bg-validated'
  if (c >= 0.6) return 'bg-uncertain'
  return 'bg-rejected'
})

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function onClickExact() {
  profileStore.toggleSelect(props.profile.id, false)
}

function onClickMulti() {
  profileStore.toggleSelect(props.profile.id, true)
}

function jumpToTimestamp() {
  playerStore.seekTo(props.profile.timestamp)
  if (playerStore.playerMode === 'closed') playerStore.setMode('mini')
}

function addToCompare() {
  const ids = [...profileStore.compareIds]
  if (!ids.includes(props.profile.id)) {
    ids.push(props.profile.id)
  }
  profileStore.setCompare(ids.slice(-2))
}

function setTag(tag) {
  profileStore.updateProfileTag(props.profile.id, tag)
}

function startEdit() {
  editName.value = props.profile.suggestedName || ''
  editing.value = true
  nextTick(() => inputRef.value?.focus())
}

function saveEdit() {
  profileStore.renameProfile(props.profile.id, editName.value.trim())
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}
</script>
