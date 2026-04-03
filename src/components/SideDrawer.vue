<template>
  <!--
    Drawer that slides over the left column from the right side of it.
    Controlled by v-model (show prop + update:show emit).
  -->
  <teleport to="body">
    <!-- Backdrop -->
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        @click="$emit('update:show', false)"
      />
    </transition>

    <!-- Panel -->
    <transition name="drawer-slide">
      <div
        v-if="show"
        class="fixed top-0 left-0 h-full z-50 flex flex-col bg-surface border-r border-border shadow-2xl"
        :style="{ width: width + 'px' }"
      >
        <!-- Header slot -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-1.5 h-5 rounded-full" :class="accentBar"/>
            <h2 class="font-display font-semibold text-sm text-bright tracking-wide">{{ title }}</h2>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded hover:bg-elevated text-dim hover:text-text transition-colors"
            @click="$emit('update:show', false)"
          >
            <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Body — scrollable -->
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>

        <!-- Footer slot -->
        <div v-if="$slots.footer" class="border-t border-border shrink-0">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
defineProps({
  show:      { type: Boolean, default: false },
  title:     { type: String,  default: '' },
  width:     { type: Number,  default: 360 },
  accentBar: { type: String,  default: 'bg-accent' },
})
defineEmits(['update:show'])
</script>

<style scoped>
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}
</style>
