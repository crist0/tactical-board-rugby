<template>
  <div class="rugby-field" :style="{ transform: `scale(${uiStore.zoomLevel})` }">
    <FieldLines />
  </div>
</template>

<script setup>
import FieldLines from '@/components/field/FieldLines.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.rugby-field {
  position: relative;
  width: 100%;
  max-height: 100%;
  aspect-ratio: 124 / 74;
  background-color: $field-green;
  transform-origin: center center;
  transition: transform 0.2s ease-in-out;
}
</style>
