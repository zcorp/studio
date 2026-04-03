<template>
  <!--
    Slim drag handle between two panels.
    Parent binds @mousedown="startDrag($event, direction)" and @dblclick="resetWidth()".

    Props:
      direction  +1 = dragging right expands left panel (default)
                 -1 = dragging right shrinks right panel
      active     pass isDragging from useResizable for immediate visual feedback
  -->
  <div
    class="relative flex-shrink-0 w-[5px] cursor-col-resize z-30 group"
    :class="active ? 'bg-accent/20' : 'bg-transparent hover:bg-accent/10'"
    style="transition: background 0.1s"
    @mousedown="$emit('dragstart', $event)"
    @dblclick="$emit('reset')"
    title="Glisser pour redimensionner · Double-clic pour réinitialiser"
  >
    <!-- The visible line -->
    <div
      class="absolute inset-y-0 left-[2px] w-px transition-all duration-100"
      :class="active
        ? 'bg-accent shadow-[0_0_6px_theme(colors.accent)]'
        : 'bg-border group-hover:bg-accent/60'"
    />

    <!-- Centre grip dots (appear on hover / active) -->
    <div
      class="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
             flex flex-col gap-[3px] opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ 'opacity-100': active }"
    >
      <div v-for="n in 4" :key="n" class="w-[3px] h-[3px] rounded-full"
        :class="active ? 'bg-accent' : 'bg-dim/60'" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  active:    { type: Boolean, default: false },
  direction: { type: Number,  default: 1 },
})
defineEmits(['dragstart', 'reset'])
</script>
