<template>
  <aside class="flex flex-col h-full bg-panel overflow-hidden">

    <!-- ── Header bar ────────────────────────────────────────────────────── -->
    <div class="px-3 py-2.5 border-b border-border flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2 min-w-0">
        <span class="font-display font-semibold text-[11px] uppercase tracking-widest text-dim">Œuvres</span>
        <span class="timecode text-[10px] shrink-0">{{ workStore.total }}</span>
        <!-- Active filter dot -->
        <div
          v-if="hasActiveFilters"
          class="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
          title="Filtres actifs"
        />
      </div>

      <div class="flex items-center gap-0.5 shrink-0">
        <!-- Filter drawer toggle -->
        <button
          class="relative w-7 h-7 flex items-center justify-center rounded transition-colors"
          :class="filterDrawer ? 'bg-info/20 text-info' : 'text-dim hover:text-text hover:bg-elevated'"
          title="Filtres (F)"
          @click="filterDrawer = true"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M1 3h12M3.5 7h7M6 11h2" stroke-linecap="round"/>
          </svg>
          <!-- Badge when filters active -->
          <span
            v-if="hasActiveFilters"
            class="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent"
          />
        </button>

        <!-- Add work drawer toggle -->
        <button
          class="w-7 h-7 flex items-center justify-center rounded text-dim hover:text-validated hover:bg-validated/10 transition-colors"
          title="Ajouter une œuvre"
          @click="openCreate"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M7 1v12M1 7h12" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Search quick bar (inline, always visible) ─────────────────────── -->
    <div class="px-2 py-1.5 border-b border-border/60 shrink-0">
      <div class="relative">
        <svg class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-dim/50 pointer-events-none"
             viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="5" cy="5" r="3.5"/><path d="M8 8l2 2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="quickSearch"
          type="text"
          placeholder="Recherche rapide…"
          class="input-dark w-full text-xs pl-6 py-1"
          @input="onQuickSearch"
        />
        <button
          v-if="quickSearch"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 text-dim/50 hover:text-dim"
          @click="clearQuickSearch"
        >
          <svg class="w-3 h-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 2l6 6M8 2l-6 6" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- ── Initial loading ────────────────────────────────────────────────── -->
    <div v-if="workStore.loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-2">
        <div class="w-5 h-5 border-2 border-border border-t-accent rounded-full animate-spin"/>
        <span class="text-[10px] font-mono text-dim/50">Chargement…</span>
      </div>
    </div>

    <!-- ── Empty state ────────────────────────────────────────────────────── -->
    <div
      v-else-if="workStore.works.length === 0"
      class="flex-1 flex flex-col items-center justify-center gap-2.5 px-4 text-center"
    >
      <svg class="w-9 h-9 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <p class="text-xs text-dim">Aucune œuvre trouvée</p>
      <button class="btn-ghost text-[10px]" @click="clearAllFilters">Effacer les filtres</button>
    </div>

    <!-- ── Content list ───────────────────────────────────────────────────── -->
    <div v-else class="flex-1 overflow-y-auto py-1">

      <!-- ════ FILMS section ════ -->
      <div v-if="workStore.visibleFilms.length > 0 || workStore.hasMoreFilms">
        <!-- Section header -->
        <div
          class="flex items-center gap-1.5 px-3 py-1 sticky top-0 z-10
                 bg-panel/95 backdrop-blur-sm border-b border-border/40"
        >
          <svg class="w-2.5 h-2.5 text-dim/60" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="2" width="10" height="8" rx="1"/>
            <rect x="3" y="1" width="1" height="2" rx="0.5"/>
            <rect x="8" y="1" width="1" height="2" rx="0.5"/>
          </svg>
          <span class="text-[9px] font-mono uppercase tracking-widest text-dim/60">Films</span>
          <span class="timecode text-[9px] ml-auto">{{ workStore.visibleFilms.length }}</span>
        </div>

        <!-- Film items -->
        <div class="px-1.5 py-0.5 space-y-0.5">
          <div
            v-for="work in workStore.visibleFilms"
            :key="work.id"
            class="relative group/item"
          >
            <WorkItem
              :work="work"
              :selected="workStore.selectedWorkId === work.id"
              @click="workStore.selectWork(work.id)"
            />
            <!-- Edit pencil on hover -->
            <button
              class="absolute right-1 top-1/2 -translate-y-1/2
                     w-6 h-6 flex items-center justify-center rounded
                     opacity-0 group-hover/item:opacity-100
                     text-dim/50 hover:text-accent hover:bg-accent/10
                     transition-all"
              title="Modifier"
              @click.stop="openEdit(work)"
            >
              <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1.5 10.5l6-6 2.5 2.5-6 6H1.5v-2.5z"/>
                <path d="M7.5 4.5l1-1a1.77 1.77 0 012.5 2.5l-1 1" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Load more films -->
        <div v-if="workStore.hasMoreFilms" class="px-2 py-1.5">
          <button
            class="w-full py-1.5 rounded border border-dashed border-border/40
                   text-[10px] font-mono text-dim/50
                   hover:border-accent/40 hover:text-accent/70
                   flex items-center justify-center gap-1.5 transition-all"
            :disabled="workStore.loadingMoreFilms"
            @click="workStore.loadMoreFilms()"
          >
            <svg
              v-if="workStore.loadingMoreFilms"
              class="w-3 h-3 animate-spin"
              viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"
            ><circle cx="6" cy="6" r="4" stroke-dasharray="12 6"/></svg>
            <svg v-else class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2v8M3 7l3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ workStore.loadingMoreFilms ? 'Chargement…' : 'Plus de films' }}
          </button>
        </div>
      </div>

      <!-- ════ SERIES section ════ -->
      <div v-if="workStore.visibleSeries.length > 0 || workStore.hasMoreSeries" class="mt-1">
        <!-- Section header -->
        <div
          class="flex items-center gap-1.5 px-3 py-1 sticky top-0 z-10
                 bg-panel/95 backdrop-blur-sm border-b border-border/40"
        >
          <svg class="w-2.5 h-2.5 text-dim/60" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="4" height="4" rx="0.5"/>
            <rect x="7" y="1" width="4" height="4" rx="0.5"/>
            <rect x="1" y="7" width="4" height="4" rx="0.5"/>
            <rect x="7" y="7" width="4" height="4" rx="0.5"/>
          </svg>
          <span class="text-[9px] font-mono uppercase tracking-widest text-dim/60">Séries</span>
          <span class="timecode text-[9px] ml-auto">{{ workStore.visibleSeries.length }}</span>
        </div>

        <!-- Serie items -->
        <div class="px-1.5 py-0.5 space-y-0.5">
          <div v-for="serie in workStore.visibleSeries" :key="serie.id">
            <div class="relative group/item">
              <WorkItem
                :work="serie"
                :selected="workStore.selectedWorkId === serie.id"
                :expanded="expandedId === serie.id"
                @click="toggleSerie(serie)"
              />
              <button
                class="absolute right-1 top-1/2 -translate-y-1/2
                       w-6 h-6 flex items-center justify-center rounded
                       opacity-0 group-hover/item:opacity-100
                       text-dim/50 hover:text-accent hover:bg-accent/10
                       transition-all"
                title="Modifier"
                @click.stop="openEdit(serie)"
              >
                <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M1.5 10.5l6-6 2.5 2.5-6 6H1.5v-2.5z"/>
                  <path d="M7.5 4.5l1-1a1.77 1.77 0 012.5 2.5l-1 1" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Episodes accordion -->
            <transition name="slide-up">
              <div
                v-if="expandedId === serie.id"
                class="ml-4 border-l border-border/50 pl-2 space-y-0.5 py-0.5"
              >
                <button
                  v-for="ep in serie.episodes"
                  :key="ep.id"
                  class="w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5"
                  :class="
                    workStore.selectedWorkId === serie.id && workStore.selectedEpisodeId === ep.id
                      ? 'bg-accent/15 text-accent'
                      : 'text-dim hover:text-text hover:bg-elevated'
                  "
                  @click.stop="workStore.selectWork(serie.id, ep.id)"
                >
                  <span class="font-mono text-[10px] text-dim/60 shrink-0">E{{ String(ep.number).padStart(2,'0') }}</span>
                  <span class="truncate">{{ ep.title }}</span>
                </button>
              </div>
            </transition>
          </div>
        </div>

        <!-- Load more series -->
        <div v-if="workStore.hasMoreSeries" class="px-2 py-1.5">
          <button
            class="w-full py-1.5 rounded border border-dashed border-border/40
                   text-[10px] font-mono text-dim/50
                   hover:border-accent/40 hover:text-accent/70
                   flex items-center justify-center gap-1.5 transition-all"
            :disabled="workStore.loadingMoreSeries"
            @click="workStore.loadMoreSeries()"
          >
            <svg
              v-if="workStore.loadingMoreSeries"
              class="w-3 h-3 animate-spin"
              viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"
            ><circle cx="6" cy="6" r="4" stroke-dasharray="12 6"/></svg>
            <svg v-else class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2v8M3 7l3 3 3-3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ workStore.loadingMoreSeries ? 'Chargement…' : 'Plus de séries' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Drawers ────────────────────────────────────────────────────────── -->
    <WorkFilterDrawer v-model:show="filterDrawer" />
    <WorkFormDrawer
      v-model:show="formDrawer"
      :work-data="editTarget"
      @saved="formDrawer = false"
    />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWorkStore }     from '@/stores/useWorkStore'
import WorkItem             from './WorkItem.vue'
import WorkFilterDrawer     from './WorkFilterDrawer.vue'
import WorkFormDrawer       from './WorkFormDrawer.vue'

const workStore = useWorkStore()

const expandedId   = ref(null)   // expanded serie ID
const filterDrawer = ref(false)
const formDrawer   = ref(false)
const editTarget   = ref(null)   // null = create, object = edit
const quickSearch  = ref('')
let   searchTimer  = null

const hasActiveFilters = computed(() =>
  workStore.filters.search || workStore.filters.genre || workStore.filters.type !== 'all'
)

onMounted(() => {
  workStore.fetchGenres()
})

function toggleSerie(serie) {
  expandedId.value = expandedId.value === serie.id ? null : serie.id
}

function openCreate() {
  editTarget.value = null
  formDrawer.value = true
}

function openEdit(work) {
  editTarget.value = work
  formDrawer.value = true
}

function onQuickSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    workStore.applyFilters({ search: quickSearch.value })
  }, 350)
}

function clearQuickSearch() {
  quickSearch.value = ''
  workStore.applyFilters({ search: '' })
}

function clearAllFilters() {
  quickSearch.value = ''
  workStore.applyFilters({ type: 'all', search: '', genre: '' })
}
</script>
