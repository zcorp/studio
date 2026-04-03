<template>
  <div class="flex flex-col h-screen overflow-hidden bg-void text-text font-body select-none">

    <!-- Top toolbar -->
    <Toolbar
      :validation-mode="validationMode"
      @toggle-validation="validationMode = !validationMode"
      @show-shortcuts="showShortcuts = true"
    />

    <!-- Validation banner -->
    <transition name="slide-up">
      <div
        v-if="validationMode"
        class="flex items-center justify-between px-4 py-1.5 bg-accent/10 border-b border-accent/30 text-xs text-accent shrink-0"
      >
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-accent animate-pulse-slow"/>
          <span class="font-mono">MODE VALIDATION RAPIDE</span>
        </div>
        <button class="btn-ghost text-xs text-accent/70 hover:text-accent" @click="validationMode = false">Quitter</button>
      </div>
    </transition>

    <!-- ── 3-column resizable layout ────────────────────────────────────── -->
    <div
      class="flex flex-1 overflow-hidden"
      :class="(leftDrag.isDragging.value || rightDrag.isDragging.value) ? 'cursor-col-resize' : ''"
    >

      <!-- Col 1 — Works -->
      <div
        class="shrink-0 overflow-hidden flex flex-col border-r border-border"
        :style="{ width: leftWidth + 'px' }"
      >
        <WorkList />
      </div>

      <!-- Resize handle left ↔ center (dir +1: drag right = widen left col) -->
      <ResizeHandle 
        :active="leftDrag.isDragging.value"
        @dragstart="leftDrag.startDrag($event, 1)"
        @reset="leftDrag.resetWidth()"
      />

      <!-- Col 2 — Center viewer -->
      <main class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <VideoPlayer />
        <div class="flex-1 overflow-hidden flex flex-col">
          <!-- Stats bar -->
          <div class="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-surface shrink-0">
            <div class="flex items-center gap-1.5 text-[10px] font-mono text-dim">
              <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="1" y="1" width="10" height="10" rx="1"/><path d="M1 4h10"/>
              </svg>
              {{ profileStore.profiles.length }} profils
            </div>
            <div class="flex items-center gap-1.5 text-[10px] font-mono text-dim">
              <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="6" cy="5" r="2.5"/><path d="M1.5 10.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/>
              </svg>
              {{ groupStore.groups.length }} groupes
            </div>
            <div v-if="profileStore.selectedIds.size > 0" class="flex items-center gap-1.5 text-[10px] font-mono text-accent">
              <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ profileStore.selectedIds.size }} sélectionné(s)
            </div>
            <div class="flex-1"/>
            <div v-if="playerStore.currentTime > 0" class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow"/>
              <span class="timecode text-[10px]">{{ playerStore.formattedTime }}</span>
            </div>
          </div>
          <ViewerPanel />
        </div>
      </main>

      <!-- Resize handle center ↔ right (dir -1: drag right = shrink right col) -->
      <ResizeHandle
        :active="rightDrag.isDragging.value"
        @dragstart="rightDrag.startDrag($event, -1)"
        @reset="rightDrag.resetWidth()"
      />

      <!-- Col 3 — Groups -->
      <div
        class="shrink-0 overflow-hidden flex flex-col border-l border-border"
        :style="{ width: rightWidth + 'px' }"
      >
        <GroupList :validation-mode="validationMode" />
      </div>
    </div>

    <!-- Modals -->
    <ShortcutsModal :show="showShortcuts" @close="showShortcuts = false" />

    <!-- Toast -->
    <transition name="slide-up">
      <div
        v-if="toast"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-elevated border border-border
               rounded-lg px-4 py-2 text-sm text-text shadow-xl flex items-center gap-2 pointer-events-none"
      >
        <div class="w-2 h-2 rounded-full shrink-0"
             :class="toast.type === 'success' ? 'bg-validated' : 'bg-accent'"/>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, watch } from 'vue' 
import Toolbar        from '@/components/Toolbar.vue'
import WorkList       from '@/components/WorkList.vue'
import VideoPlayer    from '@/components/VideoPlayer.vue'
import ViewerPanel    from '@/components/ViewerPanel.vue'
import GroupList      from '@/components/GroupList.vue'
import ShortcutsModal from '@/components/ShortcutsModal.vue'
import ResizeHandle   from '@/components/ResizeHandle.vue'
import { useWorkStore }    from '@/stores/useWorkStore'
import { useGroupStore }   from '@/stores/useGroupStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { usePlayerStore }  from '@/stores/usePlayerStore'
import { useKeyboard }     from '@/composables/useKeyboard'
import { useResizable }    from '@/composables/useResizable'

const workStore    = useWorkStore()
const groupStore   = useGroupStore()
const profileStore = useProfileStore()
const playerStore  = usePlayerStore()

// ── Resizable columns ────────────────────────────────────────────────────
const leftDrag  = useResizable('works-panel',  224, { min: 160, max: 440 })
const rightDrag = useResizable('groups-panel', 320, { min: 240, max: 560 })
const leftWidth  = leftDrag.width
const rightWidth = rightDrag.width

// ── UI state ─────────────────────────────────────────────────────────────
const validationMode = ref(false)
const showShortcuts  = ref(false)

// ── Toast system ─────────────────────────────────────────────────────────
const toast = ref(null)
let toastTimer = null
function showToast(message, type = 'info') {
  toast.value = { message, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}
provide('showToast', showToast)

// ── Keyboard + player sync ────────────────────────────────────────────────
useKeyboard()
watch(() => workStore.activeYoutubeId, (id) => playerStore.setYoutubeId(id))

// ── Bootstrap ────────────────────────────────────────────────────────────
onMounted(async () => {
  await workStore.fetchWorks()
  if (workStore.works.length > 0) {
    await workStore.selectWork(workStore.works[0].id)
    playerStore.setYoutubeId(workStore.activeYoutubeId)
  }
})
</script>
