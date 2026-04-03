<template>
  <div class="flex-1 overflow-y-auto bg-void p-3">
    <!-- Empty state -->
    <div v-if="!workStore.selectedWorkId" class="h-full flex items-center justify-center">
      <div class="text-center space-y-3 text-dim">
        <svg class="w-12 h-12 mx-auto text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
        <p class="text-sm">Sélectionnez une œuvre pour voir les frames</p>
      </div>
    </div>

    <!-- Frames grid -->
    <div v-else>
      <div class="flex items-center gap-2 mb-3">
        <span class="text-[10px] font-mono uppercase tracking-widest text-dim">Frames détectées</span>
        <span class="timecode">{{ profileStore.profiles.length }}</span>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="profile in profileStore.profiles"
          :key="profile.id"
          class="relative rounded overflow-hidden border border-border hover:border-accent/40 cursor-pointer transition-all group bg-panel"
          @click="jumpToProfile(profile)"
        >
          <!-- Frame thumbnail -->
          <img
            :src="profile.frameUrl"
            :alt="`Frame ${profile.id}`"
            class="w-full aspect-video object-cover"
            loading="lazy"
          />

          <!-- Overlay: face + timecode -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between">
              <span class="timecode text-[10px]">{{ formatTime(profile.timestamp) }}</span>
              <img
                :src="profile.faceUrl"
                class="w-7 h-7 rounded border border-accent/50 object-cover"
              />
            </div>
          </div>

          <!-- Confidence badge -->
          <div
            class="absolute top-1 right-1 text-[9px] font-mono px-1 py-0.5 rounded"
            :class="confidenceClass(profile.confidence)"
          >
            {{ Math.round(profile.confidence * 100) }}%
          </div>

          <!-- Texts extracted -->
          <div v-if="profile.texts.length" class="absolute top-1 left-1">
            <div class="w-4 h-4 rounded-full bg-info/80 flex items-center justify-center" :title="profile.texts.join(', ')">
              <svg class="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="3" width="10" height="1.5" rx="0.5"/>
                <rect x="1" y="6" width="7" height="1.5" rx="0.5"/>
                <rect x="1" y="9" width="8.5" height="1.5" rx="0.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWorkStore } from '@/stores/useWorkStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { usePlayerStore } from '@/stores/usePlayerStore'

const workStore = useWorkStore()
const profileStore = useProfileStore()
const playerStore = usePlayerStore()

function jumpToProfile(profile) {
  playerStore.seekTo(profile.timestamp)
  if (playerStore.playerMode === 'closed') {
    playerStore.setMode('mini')
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function confidenceClass(conf) {
  if (conf >= 0.8) return 'bg-validated/70 text-validated'
  if (conf >= 0.6) return 'bg-uncertain/70 text-uncertain'
  return 'bg-rejected/70 text-rejected'
}
</script>
