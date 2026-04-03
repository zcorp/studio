/**
 * Global keyboard shortcuts for the workspace.
 */
import { onMounted, onUnmounted } from 'vue'
import { useGroupStore } from '@/stores/useGroupStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { useProfileStore } from '@/stores/useProfileStore'

export function useKeyboard() {
  const groupStore = useGroupStore()
  const playerStore = usePlayerStore()
  const profileStore = useProfileStore()

  function onKeydown(e) {
    // Skip if focused on an input
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return

    switch (e.key) {
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.shiftKey ? groupStore.redo() : groupStore.undo()
        }
        break
      case 'y':
        if (e.ctrlKey || e.metaKey) groupStore.redo()
        break
      case ' ':
        e.preventDefault()
        playerStore.togglePlay()
        break
      case 'Escape':
        profileStore.clearSelection()
        profileStore.clearCompare()
        break
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          // Select all in focused group — handled by GroupColumn
        }
        break
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
