/**
 * Work Store — paginated per type (films and series load independently),
 * with filters, CRUD, and genre list.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { useGroupStore }   from './useGroupStore'
import { useProfileStore } from './useProfileStore'

const PAGE_SIZE = 5

export const useWorkStore = defineStore('work', () => {

  // ── All loaded works (cumulative, both types mixed) ──────────────────────
  const works       = ref([])
  const total       = ref(0)
  const hasMore     = ref(false)
  const page        = ref(1)
  const loading     = ref(false)
  const loadingMore = ref(false)
  const error       = ref(null)

  // ── Per-type "load more" tracking ────────────────────────────────────────
  // When filter type = 'all' we load each type independently so "More films"
  // and "More series" buttons work separately.
  const filmPage      = ref(1)
  const seriePage     = ref(1)
  const hasMoreFilms  = ref(false)
  const hasMoreSeries = ref(false)
  const loadingMoreFilms  = ref(false)
  const loadingMoreSeries = ref(false)

  // ── Filters ───────────────────────────────────────────────────────────────
  const filters = ref({ type: 'all', search: '', genre: '' })
  const genres  = ref([])

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectedWorkId    = ref(null)
  const selectedEpisodeId = ref(null)

  // ── Computed ─────────────────────────────────────────────────────────────
  const selectedWork = computed(() =>
    works.value.find(w => w.id === selectedWorkId.value) ?? null
  )
  const visibleFilms  = computed(() => works.value.filter(w => w.type === 'film'))
  const visibleSeries = computed(() => works.value.filter(w => w.type === 'serie'))

  const activeYoutubeId = computed(() => {
    const work = selectedWork.value
    if (!work) return null
    if (work.type === 'serie' && selectedEpisodeId.value) {
      return work.episodes?.find(e => e.id === selectedEpisodeId.value)?.youtubeId ?? null
    }
    return work.youtubeId ?? null
  })

  // ── Internal helpers ─────────────────────────────────────────────────────

  function _dedupe(incoming) {
    const ids = new Set(works.value.map(w => w.id))
    return incoming.filter(w => !ids.has(w.id))
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Initial fetch — resets everything */
  async function fetchWorks() {
    loading.value = true
    error.value   = null
    page.value = filmPage.value = seriePage.value = 1
    works.value = []

    try {
      if (filters.value.type === 'all') {
        // Load films + series in parallel
        const [fr, sr] = await Promise.all([
          api.getWorks({ type: 'film',  search: filters.value.search, genre: filters.value.genre, page: 1, pageSize: PAGE_SIZE }),
          api.getWorks({ type: 'serie', search: filters.value.search, genre: filters.value.genre, page: 1, pageSize: PAGE_SIZE }),
        ])
        works.value     = [...fr.items, ...sr.items]
        hasMoreFilms.value  = fr.hasMore
        hasMoreSeries.value = sr.hasMore
        total.value = fr.total + sr.total
        hasMore.value = fr.hasMore || sr.hasMore
      } else {
        const res = await api.getWorks({ ...filters.value, page: 1, pageSize: PAGE_SIZE })
        works.value   = res.items
        total.value   = res.total
        hasMore.value = res.hasMore
        if (filters.value.type === 'film')  { hasMoreFilms.value  = res.hasMore; hasMoreSeries.value = false }
        if (filters.value.type === 'serie') { hasMoreSeries.value = res.hasMore; hasMoreFilms.value  = false }
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  /** Load more films */
  async function loadMoreFilms() {
    if (!hasMoreFilms.value || loadingMoreFilms.value) return
    loadingMoreFilms.value = true
    try {
      const next = filmPage.value + 1
      const res  = await api.getWorks({
        type: 'film', search: filters.value.search, genre: filters.value.genre,
        page: next, pageSize: PAGE_SIZE,
      })
      // Append only the new items (res.items is cumulative, slice the new tail)
      const newItems = res.items.slice(filmPage.value * PAGE_SIZE)
      works.value.push(..._dedupe(newItems))
      hasMoreFilms.value = res.hasMore
      filmPage.value = next
      hasMore.value  = hasMoreFilms.value || hasMoreSeries.value
    } finally {
      loadingMoreFilms.value = false
    }
  }

  /** Load more series */
  async function loadMoreSeries() {
    if (!hasMoreSeries.value || loadingMoreSeries.value) return
    loadingMoreSeries.value = true
    try {
      const next = seriePage.value + 1
      const res  = await api.getWorks({
        type: 'serie', search: filters.value.search, genre: filters.value.genre,
        page: next, pageSize: PAGE_SIZE,
      })
      const newItems = res.items.slice(seriePage.value * PAGE_SIZE)
      works.value.push(..._dedupe(newItems))
      hasMoreSeries.value = res.hasMore
      seriePage.value = next
      hasMore.value   = hasMoreFilms.value || hasMoreSeries.value
    } finally {
      loadingMoreSeries.value = false
    }
  }

  /** Generic loadMore (used when type filter is active) */
  async function loadMore() {
    if (filters.value.type === 'film')  return loadMoreFilms()
    if (filters.value.type === 'serie') return loadMoreSeries()
    // 'all': load whichever still has more (films first)
    if (hasMoreFilms.value)  return loadMoreFilms()
    if (hasMoreSeries.value) return loadMoreSeries()
  }

  async function applyFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    await fetchWorks()
  }

  async function fetchGenres() {
    try { genres.value = await api.getGenres() } catch (_) {}
  }

  async function selectWork(workId, episodeId = null) {
    selectedWorkId.value    = workId
    selectedEpisodeId.value = episodeId
    const profileStore = useProfileStore()
    const groupStore   = useGroupStore()
    await profileStore.fetchProfiles(workId)
    await groupStore.fetchGroups(workId, profileStore.profiles)
  }

  function selectEpisode(episodeId) {
    selectedEpisodeId.value = episodeId
  }

  async function createWork(payload) {
    const created = await api.createWork(payload)
    works.value.unshift(created)
    total.value++
    return created
  }

  async function updateWork(id, payload) {
    const updated = await api.updateWork(id, payload)
    const idx = works.value.findIndex(w => w.id === id)
    if (idx !== -1) works.value[idx] = { ...works.value[idx], ...updated }
    return updated
  }

  async function deleteWork(id) {
    await api.deleteWork(id)
    works.value = works.value.filter(w => w.id !== id)
    total.value = Math.max(0, total.value - 1)
    if (selectedWorkId.value === id) {
      selectedWorkId.value    = null
      selectedEpisodeId.value = null
    }
  }

  return {
    works, total, hasMore, page, loading, loadingMore, error,
    hasMoreFilms, hasMoreSeries, loadingMoreFilms, loadingMoreSeries,
    filters, genres,
    selectedWorkId, selectedEpisodeId,
    selectedWork, visibleFilms, visibleSeries, activeYoutubeId,
    fetchWorks, loadMore, loadMoreFilms, loadMoreSeries,
    applyFilters, fetchGenres,
    selectWork, selectEpisode,
    createWork, updateWork, deleteWork,
  }
})
