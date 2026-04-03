<template>
  <SideDrawer
    v-model:show="show"
    :title="isEdit ? 'Modifier l\'œuvre' : 'Ajouter une œuvre'"
    :width="380"
    :accent-bar="isEdit ? 'bg-accent' : 'bg-validated'"
  >

    <div class="p-4 space-y-5">

      <!-- ── Type selector ────────────────────────────────────────────────── -->
      <section class="space-y-2">
        <label class="section-label">Type <span class="text-rejected">*</span></label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="t in TYPES" :key="t.value"
            class="py-3 rounded border text-sm font-medium transition-all flex flex-col items-center gap-1.5"
            :class="form.type === t.value
              ? 'border-accent/60 bg-accent/10 text-accent'
              : 'border-border text-dim hover:border-muted hover:text-text hover:bg-elevated'"
            @click="form.type = t.value"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" v-html="t.svg"/>
            {{ t.label }}
          </button>
        </div>
      </section>

      <!-- ── Title ─────────────────────────────────────────────────────────── -->
      <section class="space-y-1.5">
        <label class="section-label">Titre <span class="text-rejected">*</span></label>
        <input
          v-model="form.title"
          class="input-dark w-full py-2"
          placeholder="ex : Inception"
          :class="errors.title ? 'border-rejected/60 focus:ring-rejected/20' : ''"
        />
        <p v-if="errors.title" class="text-[10px] text-rejected flex items-center gap-1">
          <svg class="w-3 h-3" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5"/><path d="M6 4v3M6 8.5v.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>
          {{ errors.title }}
        </p>
      </section>

      <!-- ── Year + Genre ──────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 gap-3">
        <section class="space-y-1.5">
          <label class="section-label">Année <span class="text-rejected">*</span></label>
          <input
            v-model.number="form.year"
            type="number"
            min="1888"
            :max="currentYear"
            class="input-dark w-full py-2"
            placeholder="2024"
            :class="errors.year ? 'border-rejected/60' : ''"
          />
          <p v-if="errors.year" class="text-[10px] text-rejected">{{ errors.year }}</p>
        </section>
        <section class="space-y-1.5">
          <label class="section-label">Genre</label>
          <input
            v-model="form.genre"
            class="input-dark w-full py-2"
            placeholder="ex : Sci-Fi"
            list="drawer-genre-list"
          />
          <datalist id="drawer-genre-list">
            <option v-for="g in workStore.genres" :key="g" :value="g"/>
          </datalist>
        </section>
      </div>

      <!-- ── Thumbnail ─────────────────────────────────────────────────────── -->
      <section class="space-y-1.5">
        <label class="section-label">URL Miniature</label>
        <div class="flex gap-2 items-start">
          <input
            v-model="form.thumbnail"
            class="input-dark flex-1 py-2"
            placeholder="https://…"
          />
          <div class="w-10 h-14 rounded overflow-hidden border border-border bg-muted/20 shrink-0 flex items-center justify-center">
            <img
              v-if="form.thumbnail"
              :src="form.thumbnail"
              class="w-full h-full object-cover"
              @error="e => e.target.style.opacity = '0'"
            />
            <svg v-else class="w-4 h-4 text-muted" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="12" height="12" rx="1"/><path d="M2 11l4-4 3 3 2-2 3 3"/></svg>
          </div>
        </div>
      </section>

      <!-- ── Film: YouTube ID ──────────────────────────────────────────────── -->
      <section v-if="form.type === 'film'" class="space-y-1.5">
        <label class="section-label">YouTube ID</label>
        <input
          v-model="form.youtubeId"
          class="input-dark w-full py-2 font-mono"
          placeholder="ex : YoHD9XEInc0"
        />
        <p class="text-[10px] text-dim/50">Identifiant à 11 caractères visible dans l'URL YouTube</p>
      </section>

      <!-- ── Serie: Episodes ───────────────────────────────────────────────── -->
      <section v-if="form.type === 'serie'" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="section-label">Épisodes ({{ form.episodes.length }})</label>
          <button class="text-[10px] font-mono text-accent hover:text-amber-300 transition-colors flex items-center gap-1" @click="addEpisode">
            <svg class="w-3 h-3" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 1v8M1 5h8" stroke-linecap="round"/></svg>
            Ajouter
          </button>
        </div>

        <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <div
            v-for="(ep, idx) in form.episodes"
            :key="idx"
            class="flex gap-2 items-center bg-elevated/60 border border-border/50 rounded-md p-2.5 group/ep"
          >
            <span class="timecode text-[10px] w-5 text-center shrink-0">{{ ep.number }}</span>
            <input
              v-model="ep.title"
              class="input-dark flex-1 text-xs py-1"
              :placeholder="`Titre épisode ${ep.number}`"
            />
            <input
              v-model="ep.youtubeId"
              class="input-dark w-24 text-xs py-1 font-mono"
              placeholder="YT ID"
            />
            <button
              class="shrink-0 text-dim/40 hover:text-rejected transition-colors opacity-0 group-hover/ep:opacity-100"
              @click="removeEpisode(idx)"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l8 8M10 2l-8 8" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <div
          v-if="form.episodes.length === 0"
          class="text-[10px] text-dim/40 text-center py-4 border border-dashed border-border/30 rounded-md"
        >
          Aucun épisode — cliquez sur « Ajouter »
        </div>
      </section>
    </div>

    <!-- Footer actions -->
    <template #footer>
      <div class="flex items-center gap-2 p-3">
        <button
          v-if="isEdit"
          class="btn-danger text-xs flex items-center gap-1.5"
          :disabled="saving"
          @click="handleDelete"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 3h8M5 3V2h2v1M4.5 9.5l-.5-5M7.5 9.5l.5-5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Supprimer
        </button>
        <div class="flex-1"/>
        <button class="btn-ghost text-xs" @click="show = false">Annuler</button>
        <button
          class="btn-accent text-xs flex items-center gap-1.5"
          :disabled="saving"
          @click="handleSubmit"
        >
          <svg v-if="saving" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="6" cy="6" r="4.5" stroke-dasharray="14 8"/>
          </svg>
          {{ saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Créer' }}
        </button>
      </div>
    </template>

  </SideDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SideDrawer   from './SideDrawer.vue'
import { useWorkStore } from '@/stores/useWorkStore'

const props = defineProps({
  show:     Boolean,
  workData: { type: Object, default: null }, // null = create mode
})
const emit = defineEmits(['update:show', 'saved'])

const workStore = useWorkStore()
const saving    = ref(false)
const errors    = ref({})
const currentYear = new Date().getFullYear()

const show = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
})

const isEdit = computed(() => !!props.workData)

const TYPES = [
  {
    value: 'film', label: 'Film',
    svg: '<rect x="2" y="3" width="16" height="14" rx="2"/><rect x="5" y="2" width="2" height="3" rx="1"/><rect x="13" y="2" width="2" height="3" rx="1"/>',
  },
  {
    value: 'serie', label: 'Série',
    svg: '<rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/>',
  },
]

function defaultForm() {
  return { type: 'film', title: '', year: currentYear, genre: '', thumbnail: '', youtubeId: '', episodes: [] }
}

const form = ref(defaultForm())

// Reset/populate form when drawer opens
watch(() => props.show, (v) => {
  if (!v) return
  errors.value = {}
  form.value = props.workData
    ? {
        type:      props.workData.type,
        title:     props.workData.title,
        year:      props.workData.year,
        genre:     props.workData.genre     ?? '',
        thumbnail: props.workData.thumbnail ?? '',
        youtubeId: props.workData.youtubeId ?? '',
        episodes:  (props.workData.episodes ?? []).map(e => ({ ...e })),
      }
    : defaultForm()
})

function validate() {
  const e = {}
  if (!form.value.title.trim())            e.title = 'Le titre est obligatoire.'
  if (!form.value.year || form.value.year < 1888 || form.value.year > 2099)
    e.year = 'Année invalide (1888 – 2099).'
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (payload.type === 'film')  delete payload.episodes
    if (payload.type === 'serie') delete payload.youtubeId

    if (isEdit.value) {
      await workStore.updateWork(props.workData.id, payload)
    } else {
      await workStore.createWork(payload)
    }
    emit('saved')
    show.value = false
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm(`Supprimer "${props.workData.title}" ? Cette action est irréversible.`)) return
  await workStore.deleteWork(props.workData.id)
  show.value = false
}

function addEpisode() {
  form.value.episodes.push({
    id: `ep-new-${Date.now()}`, number: form.value.episodes.length + 1,
    title: '', youtubeId: '', duration: 0,
  })
}

function removeEpisode(idx) {
  form.value.episodes.splice(idx, 1)
  form.value.episodes.forEach((ep, i) => { ep.number = i + 1 })
}
</script>

<style scoped>
.section-label { @apply text-[10px] font-mono uppercase tracking-widest text-dim/70; }
</style>
