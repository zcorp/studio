/**
 * Profile Store — manages profiles and their metadata.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useProfileStore = defineStore('profile', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const profiles = ref([])
  const selectedIds = ref(new Set())
  const loading = ref(false)
  const compareIds = ref([]) // up to 2 profile IDs for side-by-side comparison

  // ── Getters ───────────────────────────────────────────────────────────────
  const byId = computed(() => {
    const map = {}
    profiles.value.forEach(p => { map[p.id] = p })
    return map
  })

  const selectedProfiles = computed(() =>
    profiles.value.filter(p => selectedIds.value.has(p.id))
  )

  const isSelected = (id) => selectedIds.value.has(id)

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchProfiles(workId) {
    loading.value = true
    try {
      profiles.value = await api.getProfiles(workId)
      selectedIds.value.clear()
    } finally {
      loading.value = false
    }
  }

  function toggleSelect(id, multi = false) {
    if (!multi) {
      // Single select: clear and select only this
      if (selectedIds.value.has(id) && selectedIds.value.size === 1) {
        selectedIds.value.clear()
      } else {
        selectedIds.value.clear()
        selectedIds.value.add(id)
      }
    } else {
      // Multi-select: toggle
      if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
      } else {
        selectedIds.value.add(id)
      }
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function selectAll(ids) {
    ids.forEach(id => selectedIds.value.add(id))
  }

  async function updateProfileTag(id, tag) {
    const profile = profiles.value.find(p => p.id === id)
    if (!profile) return
    profile.tag = tag
    await api.updateProfile(id, { tag })
  }

  async function renameProfile(id, name) {
    const profile = profiles.value.find(p => p.id === id)
    if (!profile) return
    profile.suggestedName = name
    await api.updateProfile(id, { suggestedName: name })
  }

  function setCompare(ids) {
    compareIds.value = ids.slice(0, 2)
  }

  function clearCompare() {
    compareIds.value = []
  }

  return {
    profiles, selectedIds, loading, compareIds,
    byId, selectedProfiles, isSelected,
    fetchProfiles, toggleSelect, clearSelection, selectAll,
    updateProfileTag, renameProfile, setCompare, clearCompare,
  }
})
