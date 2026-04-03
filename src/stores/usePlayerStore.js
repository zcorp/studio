/**
 * Player Store — manages YouTube player state and sync.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const playerMode = ref('open')   // 'open' | 'mini' | 'closed'
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const youtubeId = ref(null)

  // Internal reference to the YT player instance (not reactive)
  let ytPlayer = null

  // ── Getters ───────────────────────────────────────────────────────────────
  const progress = computed(() =>
    duration.value > 0 ? currentTime.value / duration.value : 0
  )

  const formattedTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))

  // ── Actions ────────────────────────────────────────────────────────────────

  function setPlayer(player) {
    ytPlayer = player
  }

  function setYoutubeId(id) {
    youtubeId.value = id
    isPlaying.value = false
    currentTime.value = 0
  }

  function setMode(mode) {
    playerMode.value = mode
  }

  function toggleMode() {
    const modes = ['open', 'mini', 'closed']
    const idx = modes.indexOf(playerMode.value)
    playerMode.value = modes[(idx + 1) % modes.length]
  }

  function play() {
    ytPlayer?.playVideo()
    isPlaying.value = true
  }

  function pause() {
    ytPlayer?.pauseVideo()
    isPlaying.value = false
  }

  function togglePlay() {
    isPlaying.value ? pause() : play()
  }

  /** Seek to a specific second */
  function seekTo(seconds) {
    ytPlayer?.seekTo(seconds, true)
    currentTime.value = seconds
  }

  function updateTime(t) {
    currentTime.value = t
  }

  function updateDuration(d) {
    duration.value = d
  }

  function setPlaying(val) {
    isPlaying.value = val
  }

  return {
    playerMode, isPlaying, currentTime, duration, youtubeId,
    progress, formattedTime, formattedDuration,
    setPlayer, setYoutubeId, setMode, toggleMode,
    play, pause, togglePlay, seekTo,
    updateTime, updateDuration, setPlaying,
  }
})

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
