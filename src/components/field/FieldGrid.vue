<template>
  <svg v-if="uiStore.showGrid" class="field-grid" viewBox="0 0 1240 740" aria-hidden="true">
    <line
      v-for="x in verticalLines"
      :key="`v-${x}`"
      :x1="x"
      y1="20"
      :x2="x"
      y2="720"
      class="grid-line"
    />
    <line
      v-for="y in horizontalLines"
      :key="`h-${y}`"
      x1="20"
      :y1="y"
      x2="1220"
      :y2="y"
      class="grid-line"
    />
  </svg>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const verticalLines = Array.from({ length: 25 }, (_, index) => 20 + index * 50);
const horizontalLines = Array.from({ length: 15 }, (_, index) => 20 + index * 50);
</script>

<style lang="scss" scoped>
.field-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line {
  stroke: #ffffff;
  stroke-opacity: 0.05;
  stroke-width: 2;
}
</style>
