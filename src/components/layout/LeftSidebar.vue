<template>
  <div class="left-sidebar">
    <!-- === Existing Controls Section === -->
    <div class="section-title">Tools</div>

    <button
      class="tool-button icon-button"
      :class="{ 'tool-button--active': uiStore.showGrid }"
      type="button"
      aria-label="Toggle field grid"
      title="Toggle field grid"
      @click="uiStore.toggleGrid"
    >
      <Grid3x3 :size="16" />
      <span>Grid</span>
    </button>

    <div class="size-control">
      <label class="control-label" for="element-size">
        Size: {{ uiStore.playerSize.toFixed(1) }}m
      </label>
      <input
        id="element-size"
        class="range-slider"
        type="range"
        min="1"
        max="5"
        step="0.1"
        :value="uiStore.playerSize"
        @input="handleSizeInput"
      />
    </div>

    <hr class="divider" />

    <!-- === Drawing Tools Section === -->
    <div class="section-title">Drawing</div>

    <div class="tools-grid">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-button"
        :class="{ 'tool-button--active': drawingStore.activeTool === tool.id }"
        type="button"
        :aria-label="tool.label"
        :title="tool.label"
        @click="drawingStore.setTool(tool.id)"
      >
        <component :is="tool.icon" :size="16" />
      </button>
    </div>

    <!-- === Drawing Options === -->
    <div class="options-section">
      <div class="option-row">
        <label class="control-label" for="stroke-color">Color</label>
        <input
          id="stroke-color"
          class="color-picker"
          type="color"
          :value="drawingStore.strokeColor"
          @input="drawingStore.setColor($event.target.value)"
        />
      </div>

      <div class="option-row">
        <label class="control-label" for="stroke-width">
          Width: {{ drawingStore.strokeWidth }}
        </label>
        <input
          id="stroke-width"
          class="range-slider"
          type="range"
          min="1"
          max="10"
          step="1"
          :value="drawingStore.strokeWidth"
          @input="drawingStore.setWidth(Number($event.target.value))"
        />
      </div>

      <div class="option-row">
        <label class="control-label" for="stroke-opacity">
          Opacity: {{ drawingStore.strokeOpacity.toFixed(1) }}
        </label>
        <input
          id="stroke-opacity"
          class="range-slider"
          type="range"
          min="0.1"
          max="1.0"
          step="0.1"
          :value="drawingStore.strokeOpacity"
          @input="drawingStore.setOpacity(Number($event.target.value))"
        />
      </div>

      <div v-if="drawingStore.canUseArrowhead" class="option-row option-row--checkbox">
        <label class="control-label" for="with-arrowhead">Arrowhead</label>
        <input
          id="with-arrowhead"
          class="checkbox-input"
          type="checkbox"
          :checked="drawingStore.withArrowhead"
          @change="drawingStore.toggleArrowhead()"
        />
      </div>
    </div>

    <button
      class="tool-button clear-button"
      type="button"
      aria-label="Clear current drawings"
      title="Clear current drawings"
      @click="drawingStore.clearDrawings()"
    >
      <Trash2 :size="16" />
      <span>Clear Drawings</span>
    </button>

    <hr class="divider" />

    <ZoomControls class="zoom-controls-slot" />
  </div>
</template>

<script setup>
import {
  Grid3x3,
  MousePointer2,
  Pencil,
  Minus,
  Spline,
  Square,
  Circle,
  Triangle,
  Eraser,
  Trash2,
} from 'lucide-vue-next';
import ZoomControls from '@/components/controls/ZoomControls.vue';
import { useUiStore } from '@/stores/uiStore';
import { useDrawingStore } from '@/stores/drawingStore';

const uiStore = useUiStore();
const drawingStore = useDrawingStore();

/**
 * Tool definitions used to render the tools grid.
 * Each entry maps a tool ID to its label and Lucide icon component.
 * @type {Array<{id: string, label: string, icon: import('vue').Component}>}
 */
const tools = [
  { id: 'cursor', label: 'Cursor', icon: MousePointer2 },
  { id: 'pencil', label: 'Pencil', icon: Pencil },
  { id: 'line', label: 'Line', icon: Minus },
  { id: 'curve', label: 'Curve', icon: Spline },
  { id: 'rectangle', label: 'Rectangle', icon: Square },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'triangle', label: 'Triangle', icon: Triangle },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

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
  background-color: #1e293b;
  color: #f1f5f9;
  padding: 16px 12px;
  gap: 10px;
  overflow-y: auto;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #94a3b8;
}

.divider {
  width: 100%;
  border: none;
  border-top: 1px solid #334155;
  margin: 4px 0;
}

/* ---- Generic control label ---- */
.control-label {
  font-size: 12px;
  font-weight: 600;
  color: #cbd5e1;
}

/* ---- Range slider ---- */
.range-slider {
  width: 100%;
  height: 4px;
  appearance: none;
  background-color: #475569;
  border-radius: 2px;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #3b82f6;
    border: 2px solid #1e293b;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #3b82f6;
    border: 2px solid #1e293b;
    cursor: pointer;
  }
}

/* ---- Generic tool button ---- */
.tool-button {
  border: 1px solid #475569;
  border-radius: 8px;
  background-color: #1e293b;
  color: #e2e8f0;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background-color: #334155;
    border-color: #64748b;
  }
}

.tool-button--active {
  background-color: #1e40af;
  border-color: #3b82f6;
  color: #ffffff;
  box-shadow: 0 0 0 1px #3b82f6;

  &:hover {
    background-color: #1e40af;
    border-color: #60a5fa;
  }
}

.icon-button {
  justify-content: flex-start;
  gap: 8px;
}

/* ---- Tools grid (4 columns, 2 rows) ---- */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.tools-grid .tool-button {
  min-height: 38px;
  padding: 0;
}

/* ---- Size control ---- */
.size-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ---- Options section ---- */
.options-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}

.option-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-row--checkbox {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

/* ---- Color picker ---- */
.color-picker {
  width: 100%;
  height: 32px;
  padding: 2px;
  border: 1px solid #475569;
  border-radius: 6px;
  background-color: #1e293b;
  cursor: pointer;
}

/* ---- Checkbox ---- */
.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
  cursor: pointer;
}

/* ---- Clear button ---- */
.clear-button {
  width: 100%;
  justify-content: center;
  border-color: #dc2626;
  color: #fca5a5;

  &:hover {
    background-color: #7f1d1d;
    border-color: #ef4444;
    color: #fecaca;
  }
}

/* ---- Zoom controls slot ---- */
.zoom-controls-slot {
  margin-top: auto;
  align-self: center;
}
</style>