<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" @click.self="$emit('close')">
      <div class="bg-panel border border-border rounded-lg w-96 shadow-2xl animate-slide-in">
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <span class="font-display font-semibold text-sm text-bright">Raccourcis clavier</span>
          <button class="btn-ghost px-2 py-1 text-dim" @click="$emit('close')">✕</button>
        </div>
        <div class="p-4 space-y-1">
          <ShortcutRow keys="Espace" label="Play / Pause"/>
          <ShortcutRow keys="Ctrl+Z" label="Annuler"/>
          <ShortcutRow keys="Ctrl+Y / Ctrl+Shift+Z" label="Rétablir"/>
          <ShortcutRow keys="Échap" label="Désélectionner tout"/>
          <ShortcutRow keys="Ctrl+Clic" label="Sélection multiple"/>
          <ShortcutRow keys="Double-clic nom" label="Renommer profil / groupe"/>
          <ShortcutRow keys="V (toolbar)" label="Mode validation rapide"/>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import ShortcutRow from './ShortcutRow.vue'
defineProps({ show: Boolean })
defineEmits(['close'])
</script>
