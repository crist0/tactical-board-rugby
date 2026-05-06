<template>
  <div class="zoom-controls" role="group" aria-label="Zoom controls">
    <button
      class="zoom-button"
      type="button"
      :disabled="uiStore.zoomLevel === uiStore.minZoom"
      aria-label="Zoom out"
      @click="uiStore.zoomOut"
    >
      <ZoomOut :size="16" />
    </button>

    <button class="zoom-button zoom-button--center" type="button" aria-label="Reset zoom" @click="uiStore.resetZoom">
      <RotateCcw :size="14" />
      <span>{{ zoomPercentage }}%</span>
    </button>

    <button
      class="zoom-button"
      type="button"
      :disabled="uiStore.zoomLevel === uiStore.maxZoom"
      aria-label="Zoom in"
      @click="uiStore.zoomIn"
    >
      <ZoomIn :size="16" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-vue-next';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const zoomPercentage = computed(() => Math.round(uiStore.zoomLevel * 100));
</script>

<style lang="scss" scoped>
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid #cbd5e1;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.1);
}

.zoom-button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  color: #1e293b;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  padding: 0 8px;
}

.zoom-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.zoom-button--center {
  min-width: 84px;
  font-size: 12px;
  font-weight: 600;
}
</style>
