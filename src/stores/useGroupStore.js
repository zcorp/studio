/**
 * Group Store — manages groups with undo/redo support.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useGroupStore = defineStore('group', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const groups = ref([])
  const focusedGroupId = ref(null)
  const loading = ref(false)

  // Undo/Redo stacks — each entry is a serialized snapshot of groups
  const undoStack = ref([])
  const redoStack = ref([])

  // ── Getters ───────────────────────────────────────────────────────────────
  const validatedGroup = computed(() => groups.value.find(g => g.type === 'validated'))
  const defaultGroup = computed(() => groups.value.find(g => g.type === 'default'))
  const dynamicGroups = computed(() => groups.value.filter(g => g.type === 'dynamic'))

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  // ── Snapshot helpers ───────────────────────────────────────────────────────
  function snapshot() {
    return JSON.parse(JSON.stringify(groups.value))
  }

  function pushUndo() {
    undoStack.value.push(snapshot())
    redoStack.value = [] // clear redo on new action
    if (undoStack.value.length > 50) undoStack.value.shift()
  }

  function undo() {
    if (!canUndo.value) return
    redoStack.value.push(snapshot())
    groups.value = undoStack.value.pop()
  }

  function redo() {
    if (!canRedo.value) return
    undoStack.value.push(snapshot())
    groups.value = redoStack.value.pop()
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function fetchGroups(workId, profiles) {
    loading.value = true
    try {
      groups.value = await api.getGroups(workId, profiles)
      undoStack.value = []
      redoStack.value = []
    } finally {
      loading.value = false
    }
  }

  async function createGroup(workId) {
    pushUndo()
    const newGroup = await api.createGroup({
      workId,
      name: `Groupe ${dynamicGroups.value.length + 1}`,
      type: 'dynamic',
      fixed: false,
      profileIds: [],
    })
    groups.value.push(newGroup)
    return newGroup
  }

  async function deleteGroup(groupId) {
    pushUndo()
    const group = groups.value.find(g => g.id === groupId)
    if (!group || group.fixed) return

    // Move profiles to default group
    const def = defaultGroup.value
    if (def) {
      def.profileIds.push(...group.profileIds)
    }

    groups.value = groups.value.filter(g => g.id !== groupId)
    await api.deleteGroup(groupId)
  }

  function renameGroup(groupId, name) {
    pushUndo()
    const group = groups.value.find(g => g.id === groupId)
    if (group) group.name = name
  }

  /**
   * Move a profile (or multiple) from sourceGroupId to targetGroupId.
   * profileIds: array of profile IDs to move.
   */
  function moveProfiles(profileIds, targetGroupId) {
    pushUndo()
    const ids = Array.isArray(profileIds) ? profileIds : [profileIds]

    // Remove from all groups
    groups.value.forEach(g => {
      g.profileIds = g.profileIds.filter(pid => !ids.includes(pid))
    })

    // Add to target
    const target = groups.value.find(g => g.id === targetGroupId)
    if (target) {
      target.profileIds.push(...ids)
    }
  }

  /**
   * Reorder profiles within a group (drag & drop result).
   */
  function reorderProfilesInGroup(groupId, newOrder) {
    pushUndo()
    const group = groups.value.find(g => g.id === groupId)
    if (group) group.profileIds = newOrder
  }

  /**
   * Reorder dynamic groups (drag & drop on group list).
   */
  function reorderDynamicGroups(newOrder) {
    pushUndo()
    const fixed = groups.value.filter(g => g.fixed)
    groups.value = [...fixed, ...newOrder]
  }

  function setFocus(groupId) {
    focusedGroupId.value = focusedGroupId.value === groupId ? null : groupId
  }

  return {
    groups, focusedGroupId, loading,
    validatedGroup, defaultGroup, dynamicGroups,
    canUndo, canRedo,
    fetchGroups, createGroup, deleteGroup, renameGroup,
    moveProfiles, reorderProfilesInGroup, reorderDynamicGroups,
    setFocus, undo, redo,
  }
})
