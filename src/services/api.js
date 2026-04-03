/**
 * API Service — Mock implementation with pagination + CRUD on works.
 * Set USE_MOCK = false and VITE_API_URL to connect a real backend.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Full mock catalogue (16 items for pagination demo) ──────────────────────

const MOCK_WORKS_DB = [
  { id: 'w1',  type: 'film', title: 'Inception',             year: 2010, genre: 'Sci-Fi',   thumbnail: 'https://picsum.photos/seed/inception/80/120',    youtubeId: 'YoHD9XEInc0', duration: 8880 },
  { id: 'w2',  type: 'film', title: 'Blade Runner 2049',     year: 2017, genre: 'Sci-Fi',   thumbnail: 'https://picsum.photos/seed/bladerunner/80/120',  youtubeId: 'gD6qtc2Fgrg', duration: 9780 },
  { id: 'w3',  type: 'film', title: 'The Godfather',         year: 1972, genre: 'Drame',    thumbnail: 'https://picsum.photos/seed/godfather/80/120',    youtubeId: 'sY1S34973zA', duration: 10500 },
  { id: 'w4',  type: 'film', title: 'Interstellar',          year: 2014, genre: 'Sci-Fi',   thumbnail: 'https://picsum.photos/seed/interstellar/80/120', youtubeId: 'zSWdZVtXT7E', duration: 10140 },
  { id: 'w5',  type: 'film', title: 'Parasite',              year: 2019, genre: 'Thriller', thumbnail: 'https://picsum.photos/seed/parasite/80/120',     youtubeId: '5xH0HfJHsaY', duration: 8220 },
  { id: 'w6',  type: 'film', title: 'Portrait de la Jeune Fille en Feu', year: 2019, genre: 'Drame', thumbnail: 'https://picsum.photos/seed/portrait/80/120', youtubeId: 'dQw4w9WgXcQ', duration: 7200 },
  { id: 'w7',  type: 'film', title: 'Mad Max: Fury Road',    year: 2015, genre: 'Action',   thumbnail: 'https://picsum.photos/seed/madmax/80/120',       youtubeId: 'hEJnMQG9ev8', duration: 7260 },
  { id: 'w8',  type: 'film', title: 'La La Land',            year: 2016, genre: 'Musical',  thumbnail: 'https://picsum.photos/seed/lalaland/80/120',     youtubeId: '0pdqf4P9MB8', duration: 7980 },
  { id: 'w9',  type: 'film', title: '2001: A Space Odyssey', year: 1968, genre: 'Sci-Fi',   thumbnail: 'https://picsum.photos/seed/2001/80/120',         youtubeId: 'oR_e9y-bka0', duration: 8580 },
  { id: 'w10', type: 'film', title: 'Mulholland Drive',      year: 2001, genre: 'Mystère',  thumbnail: 'https://picsum.photos/seed/mulholland/80/120',   youtubeId: 'dQw4w9WgXcQ', duration: 8820 },
  {
    id: 'w11', type: 'serie', title: 'The Bear', year: 2022, genre: 'Drame',
    thumbnail: 'https://picsum.photos/seed/thebear/80/120',
    episodes: [
      { id: 'e11-1', number: 1, title: 'Système',  youtubeId: 'dQw4w9WgXcQ', duration: 2340 },
      { id: 'e11-2', number: 2, title: 'Ours',      youtubeId: 'dQw4w9WgXcQ', duration: 2280 },
      { id: 'e11-3', number: 3, title: 'Braciole',  youtubeId: 'dQw4w9WgXcQ', duration: 2160 },
    ],
  },
  {
    id: 'w12', type: 'serie', title: 'Severance', year: 2022, genre: 'Sci-Fi',
    thumbnail: 'https://picsum.photos/seed/severance/80/120',
    episodes: [
      { id: 'e12-1', number: 1, title: 'Good News About Hell', youtubeId: 'dQw4w9WgXcQ', duration: 2700 },
      { id: 'e12-2', number: 2, title: 'Half Loop',            youtubeId: 'dQw4w9WgXcQ', duration: 2580 },
    ],
  },
  {
    id: 'w13', type: 'serie', title: 'Succession', year: 2018, genre: 'Drame',
    thumbnail: 'https://picsum.photos/seed/succession/80/120',
    episodes: [
      { id: 'e13-1', number: 1, title: 'Celebration', youtubeId: 'dQw4w9WgXcQ', duration: 3600 },
      { id: 'e13-2', number: 2, title: 'Shit Show…',  youtubeId: 'dQw4w9WgXcQ', duration: 3420 },
    ],
  },
  {
    id: 'w14', type: 'serie', title: 'Dark', year: 2017, genre: 'Sci-Fi',
    thumbnail: 'https://picsum.photos/seed/dark/80/120',
    episodes: [
      { id: 'e14-1', number: 1, title: 'Secrets', youtubeId: 'dQw4w9WgXcQ', duration: 2880 },
      { id: 'e14-2', number: 2, title: 'Lies',     youtubeId: 'dQw4w9WgXcQ', duration: 2760 },
    ],
  },
  {
    id: 'w15', type: 'serie', title: 'Fleabag', year: 2016, genre: 'Comédie',
    thumbnail: 'https://picsum.photos/seed/fleabag/80/120',
    episodes: [
      { id: 'e15-1', number: 1, title: 'Épisode 1', youtubeId: 'dQw4w9WgXcQ', duration: 1860 },
      { id: 'e15-2', number: 2, title: 'Épisode 2', youtubeId: 'dQw4w9WgXcQ', duration: 1800 },
    ],
  },
  {
    id: 'w16', type: 'serie', title: 'The Wire', year: 2002, genre: 'Policier',
    thumbnail: 'https://picsum.photos/seed/thewire/80/120',
    episodes: [
      { id: 'e16-1', number: 1, title: 'The Target', youtubeId: 'dQw4w9WgXcQ', duration: 3540 },
      { id: 'e16-2', number: 2, title: 'The Detail',  youtubeId: 'dQw4w9WgXcQ', duration: 3480 },
    ],
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Filter + paginate works.
 * Returns { items, total, hasMore, page, pageSize }
 */
function filterWorks({ type = 'all', search = '', genre = '', page = 1, pageSize = 5 } = {}) {
  let list = [...MOCK_WORKS_DB]
  if (type === 'film')  list = list.filter(w => w.type === 'film')
  if (type === 'serie') list = list.filter(w => w.type === 'serie')
  if (search.trim()) {
    const q = search.trim().toLowerCase()
    list = list.filter(w => w.title.toLowerCase().includes(q))
  }
  if (genre) list = list.filter(w => w.genre === genre)

  const total   = list.length
  const hasMore = page * pageSize < total
  const items   = list.slice(0, page * pageSize)
  return { items, total, hasMore, page, pageSize }
}

function getAllGenres() {
  return [...new Set(MOCK_WORKS_DB.map(w => w.genre))].sort()
}

// ─── Profiles + Groups generators ────────────────────────────────────────────

function generateProfiles(workId) {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank']
  const tags  = ['principal', 'figurant', 'uncertain']
  const profiles = []
  for (let i = 1; i <= 16; i++) {
    profiles.push({
      id: `${workId}-p${i}`,
      workId,
      faceUrl:   `https://picsum.photos/seed/${workId}${i}/64/64`,
      timestamp: Math.floor(Math.random() * 3600),
      frameUrl:  `https://picsum.photos/seed/frame${workId}${i}/160/90`,
      suggestedName: i <= 4 ? names[i - 1] : null,
      texts: i % 3 === 0 ? [`Texte détecté ${i}`, 'Sous-titre exemple'] : [],
      tag:  tags[i % 3],
      confidence: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
    })
  }
  return profiles
}

function generateGroups(workId, profiles) {
  return [
    { id: `${workId}-g1`, workId, name: 'Validés',        type: 'validated', fixed: true,  profileIds: profiles.slice(0,  2).map(p => p.id) },
    { id: `${workId}-g2`, workId, name: 'Non classifiés', type: 'default',   fixed: true,  profileIds: profiles.slice(2, 10).map(p => p.id) },
    { id: `${workId}-g3`, workId, name: 'Groupe A',       type: 'dynamic',   fixed: false, profileIds: profiles.slice(10, 13).map(p => p.id) },
    { id: `${workId}-g4`, workId, name: 'Groupe B',       type: 'dynamic',   fixed: false, profileIds: profiles.slice(13).map(p => p.id) },
  ]
}

// ─── USE_MOCK toggle ──────────────────────────────────────────────────────────
const USE_MOCK = true

// ─── Exported API ─────────────────────────────────────────────────────────────

export const api = {

  /** GET /works — paginated + filtered */
  async getWorks(params = {}) {
    if (USE_MOCK) { await delay(300); return filterWorks(params) }
    const { data } = await http.get('/works', { params })
    return data
  },

  /** GET /works/genres */
  async getGenres() {
    if (USE_MOCK) { await delay(80); return getAllGenres() }
    const { data } = await http.get('/works/genres')
    return data
  },

  /** GET /works/:id */
  async getWork(id) {
    if (USE_MOCK) { await delay(150); return MOCK_WORKS_DB.find(w => w.id === id) || null }
    const { data } = await http.get(`/works/${id}`)
    return data
  },

  /** POST /works */
  async createWork(payload) {
    if (USE_MOCK) {
      await delay(200)
      const newWork = { ...payload, id: `w-${Date.now()}` }
      MOCK_WORKS_DB.push(newWork)
      return newWork
    }
    const { data } = await http.post('/works', payload)
    return data
  },

  /** PUT /works/:id */
  async updateWork(id, payload) {
    if (USE_MOCK) {
      await delay(150)
      const idx = MOCK_WORKS_DB.findIndex(w => w.id === id)
      if (idx !== -1) Object.assign(MOCK_WORKS_DB[idx], payload)
      return MOCK_WORKS_DB[idx]
    }
    const { data } = await http.put(`/works/${id}`, payload)
    return data
  },

  /** DELETE /works/:id */
  async deleteWork(id) {
    if (USE_MOCK) {
      await delay(150)
      const idx = MOCK_WORKS_DB.findIndex(w => w.id === id)
      if (idx !== -1) MOCK_WORKS_DB.splice(idx, 1)
      return { success: true }
    }
    const { data } = await http.delete(`/works/${id}`)
    return data
  },

  async getProfiles(workId) {
    if (USE_MOCK) { await delay(250); return generateProfiles(workId) }
    const { data } = await http.get('/profiles', { params: { workId } })
    return data
  },

  async getGroups(workId, profiles) {
    if (USE_MOCK) { await delay(200); return generateGroups(workId, profiles) }
    const { data } = await http.get('/groups', { params: { workId } })
    return data
  },

  async createGroup(payload) {
    if (USE_MOCK) { await delay(100); return { ...payload, id: `g-${Date.now()}` } }
    const { data } = await http.post('/groups', payload)
    return data
  },

  async updateProfile(id, payload) {
    if (USE_MOCK) { await delay(80); return { id, ...payload } }
    const { data } = await http.put(`/profiles/${id}`, payload)
    return data
  },

  async deleteGroup(id) {
    if (USE_MOCK) { await delay(100); return { success: true } }
    const { data } = await http.delete(`/groups/${id}`)
    return data
  },
}

export default api
