<template>
  <div class="flex flex-col bg-surface border-b border-border" :class="containerClass">
    <!-- Collapsed bar -->
    <div v-if="player.playerMode === 'closed'" class="flex items-center justify-between px-3 py-1.5">
      <span class="text-xs text-dim font-mono">Lecteur masqué</span>
      <button class="btn-ghost text-xs" @click="player.setMode('open')">Afficher</button>
    </div>

    <template v-else>
      <!-- Player area -->
      <div class="relative bg-black overflow-hidden" :class="videoAreaClass">
        <!-- YouTube iframe -->
        <div v-if="player.youtubeId" :id="PLAYER_CONTAINER_ID" class="w-full h-full"/>
        <div v-else class="w-full h-full flex items-center justify-center text-dim text-sm">
          <div class="text-center space-y-2">
            <svg class="w-10 h-10 mx-auto text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
            <p class="text-xs">Sélectionnez une œuvre</p> 
          </div>
        </div>

        <!-- Mini mode overlay badge -->
        <div
          v-if="player.playerMode === 'mini'"
          class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          @click="player.setMode('open')"
        >
          <span class="text-xs text-white">Agrandir</span>
        </div>
      </div>

      <!-- Controls bar -->
      <div class="flex items-center gap-2 px-3 py-2 border-t border-border bg-panel">
        <!-- Play/Pause -->
        <button class="w-7 h-7 flex items-center justify-center rounded hover:bg-elevated transition-colors" @click="player.togglePlay()">
          <svg v-if="player.isPlaying" class="w-4 h-4 text-text" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="3.5" height="12" rx="1"/>
            <rect x="9.5" y="2" width="3.5" height="12" rx="1"/>
          </svg>
          <svg v-else class="w-4 h-4 text-text" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="3,2 14,8 3,14"/>
          </svg>
        </button>

        <!-- Timecode -->
        <span class="timecode text-xs select-none">
          {{ player.formattedTime }} / {{ player.formattedDuration }}
        </span>

        <!-- Seekbar -->
        <div class="flex-1 h-1.5 bg-muted/40 rounded-full relative cursor-pointer group" @click="seek($event)">
          <div
            class="absolute left-0 top-0 h-full bg-accent rounded-full transition-all"
            :style="{ width: `${player.progress * 100}%` }"
          />
          <!-- Thumb -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent shadow-glow-accent opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ left: `calc(${player.progress * 100}% - 5px)` }"
          />
        </div>

        <!-- Mode toggles -->
        <div class="flex items-center gap-1 ml-1">
          <button
            v-for="mode in MODES"
            :key="mode.value"
            class="btn-ghost text-[10px] px-1.5 py-0.5"
            :class="{ 'text-accent': player.playerMode === mode.value }"
            @click="player.setMode(mode.value)"
            :title="mode.label"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted, ref } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'

const PLAYER_CONTAINER_ID = 'yt-player'
const MODES = [
  { value: 'open', label: 'Ouvert' },
  { value: 'mini', label: 'Mini' },
  { value: 'closed', label: 'Masqué' },
]

const player = usePlayerStore()
let ytPlayer = null
let pollInterval = null

const containerClass = computed(() => {
  if (player.playerMode === 'closed') return 'h-8'
  if (player.playerMode === 'mini') return 'h-28'
  return 'h-56'
})

const videoAreaClass = computed(() => {
  if (player.playerMode === 'mini') return 'flex-1 h-20'
  return 'flex-1'
})

// ── YouTube IFrame API ─────────────────────────────────────────────────────

function loadYTApi() {
  if (window.YT) { initPlayer(); return }
  const tag = document.createElement('script')
  tag.src = 'https://www.youtube.com/iframe_api'
  document.head.appendChild(tag)
  window.onYouTubeIframeAPIReady = initPlayer
}

function initPlayer() {
  if (!player.youtubeId) return
  destroyPlayer()
  ytPlayer = new window.YT.Player(PLAYER_CONTAINER_ID, {
    videoId: player.youtubeId,
    playerVars: { controls: 0, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => {
        player.setPlayer(ytPlayer)
        player.updateDuration(ytPlayer.getDuration())
        startPoll()
      },
      onStateChange: (e) => {
        player.setPlaying(e.data === window.YT.PlayerState.PLAYING)
      },
    },
  })
}

function destroyPlayer() {
  stopPoll()
  ytPlayer?.destroy()
  ytPlayer = null
}

function startPoll() {
  stopPoll()
  pollInterval = setInterval(() => {
    if (ytPlayer?.getCurrentTime) {
      player.updateTime(ytPlayer.getCurrentTime())
      player.updateDuration(ytPlayer.getDuration())
    }
  }, 500)
}

function stopPoll() {
  clearInterval(pollInterval)
}

function seek(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  const t = ratio * player.duration
  player.seekTo(t)
}

// Re-init player when youtubeId changes
watch(() => player.youtubeId, (id) => {
  if (!id) { destroyPlayer(); return }
  if (window.YT?.Player) initPlayer()
})

onMounted(() => loadYTApi())
onUnmounted(() => destroyPlayer())
</script>
