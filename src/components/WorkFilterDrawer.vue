<template>
  <SideDrawer v-model:show="show" title="Filtrer les œuvres" :width="320" accent-bar="bg-info">

    <div class="p-4 space-y-5">

      <!-- ── Type ────────────────────────────────────────────────────────── -->
      <section class="space-y-2">
        <label class="section-label">Type de contenu</label>
        <div class="flex rounded-md overflow-hidden border border-border">
          <button
            v-for="t in TYPES" :key="t.value"
            class="flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            :class="local.type === t.value
              ? 'bg-accent/20 text-accent border-x border-accent/30'
              : 'text-dim hover:text-text hover:bg-elevated'"
            @click="local.type = t.value"
          >
            <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor" v-html="t.svg"/>
            {{ t.label }}
          </button>
        </div>
      </section>

      <!-- ── Search ──────────────────────────────────────────────────────── -->
      <section class="space-y-2">
        <label class="section-label">Titre</label>
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim pointer-events-none"
               viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="7" cy="7" r="5"/><path d="M12 12l2.5 2.5" stroke-linecap="round"/>
          </svg>
          <input
            v-model="local.search"
            type="text"
            placeholder="Rechercher par titre…"
            class="input-dark w-full pl-8 py-2"
          />
          <button v-if="local.search" class="absolute right-2 top-1/2 -translate-y-1/2 text-dim hover:text-text"
                  @click="local.search = ''">
            <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 2l8 8M10 2l-8 8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </section>

      <!-- ── Genre ───────────────────────────────────────────────────────── -->
      <section class="space-y-2">
        <label class="section-label">Genre</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            class="text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all"
            :class="local.genre === ''
              ? 'bg-accent/15 border-accent/40 text-accent'
              : 'border-border text-dim hover:border-muted hover:text-text'"
            @click="local.genre = ''"
          >Tous</button>
          <button
            v-for="g in workStore.genres" :key="g"
            class="text-[11px] font-mono px-2.5 py-1 rounded-full border transition-all"
            :class="local.genre === g
              ? 'bg-accent/15 border-accent/40 text-accent'
              : 'border-border text-dim hover:border-muted hover:text-text'"
            @click="local.genre = g"
          >{{ g }}</button>
        </div>
      </section>

      <!-- ── Active filters summary ──────────────────────────────────────── -->
      <section v-if="hasActiveFilters" class="pt-2 border-t border-border/40 space-y-1.5">
        <label class="section-label">Filtres actifs</label>
        <div class="flex flex-wrap gap-1.5">
          <span v-if="local.type !== 'all'" class="filter-chip text-accent bg-accent/10 border-accent/30">
            {{ TYPES.find(t => t.value === local.type)?.label }}
            <button @click="local.type = 'all'">✕</button>
          </span>
          <span v-if="local.search" class="filter-chip text-info bg-info/10 border-info/30">
            "{{ local.search }}"
            <button @click="local.search = ''">✕</button>
          </span>
          <span v-if="local.genre" class="filter-chip text-uncertain bg-uncertain/10 border-uncertain/30">
            {{ local.genre }}
            <button @click="local.genre = ''">✕</button>
          </span>
        </div>
      </section>
    </div>

    <!-- Footer actions -->
    <template #footer>
      <div class="flex items-center gap-2 p-3">
        <button class="btn-ghost flex-1 justify-center text-xs" @click="reset">
          Réinitialiser
        </button>
        <button class="btn-accent flex-1 justify-center text-xs" @click="apply">
          Appliquer
        </button>
      </div>
    </template>

  </SideDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SideDrawer from './SideDrawer.vue'
import { useWorkStore } from '@/stores/useWorkStore'

const props = defineProps({ show: Boolean })
const emit  = defineEmits(['update:show'])

const workStore = useWorkStore()

const show = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
})

const TYPES = [
  { value: 'all',   label: 'Tous',   svg: '<rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/>' },
  { value: 'film',  label: 'Films',  svg: '<rect x="1" y="2" width="10" height="8" rx="1"/><rect x="3" y="1" width="1" height="2" rx="0.5"/><rect x="8" y="1" width="1" height="2" rx="0.5"/>' },
  { value: 'serie', label: 'Séries', svg: '<rect x="1" y="1" width="4" height="4" rx="0.5"/><rect x="7" y="1" width="4" height="4" rx="0.5"/><rect x="1" y="7" width="4" height="4" rx="0.5"/><rect x="7" y="7" width="4" height="4" rx="0.5"/>' },
]

// Local copy of filters (not applied until "Appliquer")
const local = ref({ ...workStore.filters })

// Sync from store when drawer opens
watch(() => props.show, (v) => {
  if (v) local.value = { ...workStore.filters }
})

const hasActiveFilters = computed(() =>
  local.value.type !== 'all' || local.value.search || local.value.genre
)

function apply() {
  workStore.applyFilters({ ...local.value })
  show.value = false
}

function reset() {
  local.value = { type: 'all', search: '', genre: '' }
  workStore.applyFilters({ type: 'all', search: '', genre: '' })
  show.value = false
}
</script>

<style scoped>
.section-label {
  @apply text-[10px] font-mono uppercase tracking-widest text-dim/70;
}
.filter-chip {
  @apply inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border;
}
.filter-chip button {
  @apply hover:opacity-70 transition-opacity;
}
</style>
