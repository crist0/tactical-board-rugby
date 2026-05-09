<template>
  <div class="left-sidebar">
    <div class="tools-title">Tools</div>
    <button
      class="tool-button"
      :class="{ 'tool-button--active': uiStore.showGrid }"
      type="button"
      aria-label="Toggle field grid"
      @click="uiStore.toggleGrid"
    >
      <Grid3x3 :size="16" />
      <span>Grid</span>
    </button>
    <div class="size-control">
      <label class="size-label" for="element-size">Size: {{ uiStore.playerSize.toFixed(1) }} meters</label>
      <input
        id="element-size"
        class="size-slider"
        type="range"
        min="1"
        max="5"
        step="0.1"
        :value="uiStore.playerSize"
        @input="handleSizeInput"
      />
    </div>
    <ZoomControls class="zoom-controls-slot" />
  </div>
</template>

<script setup>
import { Grid3x3 } from 'lucide-vue-next';
import ZoomControls from '@/components/controls/ZoomControls.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();

/**
 * Handles the input event for the size slider.
 * @param {Event} event The input event.
 */
const handleSizeInput = (event) => {
  const nextSize = Number.parseFloat(event.target.value);
  if (!Number.isNaN(nextSize)) {
    uiStore.setPlayerSize(nextSize);
  }
};
</script>

<style lang="scss" scoped>
.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #e9f2ff;
  color: #1c3d6e;
  padding: 16px 12px;
  gap: 12px;
}

.tools-title {
  font-weight: 700;
  letter-spacing: 0.03em;
}

.tool-button {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background-color: #ffffff;
  color: #1e293b;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
}

.tool-button--active {
  background-color: #1c3d6e;
  border-color: #1c3d6e;
  color: #ffffff;
}

.size-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.size-label {
  font-size: 12px;
  font-weight: 700;
  color: #1c3d6e;
}

.size-slider {
  width: 100%;
}

.zoom-controls-slot {
  margin-top: auto;
  align-self: center;
}
</style>
