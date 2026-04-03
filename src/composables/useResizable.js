/**
 * useResizable — drag-to-resize panels, VS Code style.
 *
 * @param {string} key         – localStorage key for persistence
 * @param {number} defaultPx   – default width in pixels
 * @param {object} options     – { min, max } clamp values
 *
 * Returns { width, isDragging, startDrag, resetWidth }
 *
 * Usage in template:
 *   <div :style="{ width: width + 'px' }">…</div>
 *   <ResizeHandle @mousedown.native="startDrag" @dblclick.native="resetWidth" />
 */
import { ref, onUnmounted } from 'vue'

export function useResizable(key, defaultPx, { min = 140, max = 600 } = {}) {
  const stored = typeof localStorage !== 'undefined'
    ? parseInt(localStorage.getItem(`rz:${key}`), 10)
    : NaN

  const width      = ref(isNaN(stored) ? defaultPx : Math.min(max, Math.max(min, stored)))
  const isDragging = ref(false)

  let _startX = 0
  let _startW = 0
  // direction: +1 means dragging right grows the panel (left panel),
  //            -1 means dragging right shrinks the panel (right panel)
  let _dir = 1

  function startDrag(e, direction = 1) {
    e.preventDefault()
    _startX     = e.clientX
    _startW     = width.value
    _dir        = direction
    isDragging.value = true

    document.body.style.cursor     = 'col-resize'
    document.body.style.userSelect = 'none'

    window.addEventListener('mousemove', _onMove)
    window.addEventListener('mouseup',   _onUp,   { once: true })
  }

  function _onMove(e) {
    const delta = (e.clientX - _startX) * _dir
    width.value = Math.min(max, Math.max(min, _startW + delta))
  }

  function _onUp() {
    isDragging.value = false
    document.body.style.cursor     = ''
    document.body.style.userSelect = ''
    try { localStorage.setItem(`rz:${key}`, String(width.value)) } catch (_) {}
    window.removeEventListener('mousemove', _onMove)
  }

  function resetWidth() {
    width.value = defaultPx
    try { localStorage.removeItem(`rz:${key}`) } catch (_) {}
  }

  onUnmounted(() => {
    window.removeEventListener('mousemove', _onMove)
    window.removeEventListener('mouseup',   _onUp)
  })

  return { width, isDragging, startDrag, resetWidth }
}
