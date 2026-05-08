<template>
  <div
    class="rugby-field-wrapper"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseLeave"
    @wheel.prevent="handleWheel"
  >
    <div
      ref="fieldRef"
      class="rugby-field"
      :class="{ 'is-dragging': uiStore.isDragging }"
      :style="fieldStyles"
      @mousedown.prevent="handleMouseDown"
    >
      <FieldLines ref="fieldLinesRef" />
      <FieldGrid />
    </div>
    <div v-if="cursorX !== null && cursorY !== null" class="cursor-coordinates">
      X: {{ cursorX }}m | Y: {{ cursorY }}m
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import FieldLines from '@/components/field/FieldLines.vue';
import FieldGrid from '@/components/field/FieldGrid.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const fieldRef = ref(null);
const fieldLinesRef = ref(null);
const cursorX = ref(null);
const cursorY = ref(null);

const getMaxPanBounds = () => {
  const el = fieldRef.value;
  if (!el) {
    return { maxPanX: 0, maxPanY: 0 };
  }

  const { clientWidth, clientHeight } = el;
  const maxPanX = Math.max((clientWidth * uiStore.zoomLevel - clientWidth) / 2, 0);
  const maxPanY = Math.max((clientHeight * uiStore.zoomLevel - clientHeight) / 2, 0);
  return { maxPanX, maxPanY };
};

const clampPan = (x, y) => {
  if (uiStore.zoomLevel <= 1) {
    return { x: 0, y: 0 };
  }

  const { maxPanX, maxPanY } = getMaxPanBounds();
  return {
    x: Math.min(Math.max(x, -maxPanX), maxPanX),
    y: Math.min(Math.max(y, -maxPanY), maxPanY),
  };
};

const handleMouseDown = (event) => {
  if (uiStore.zoomLevel <= 1) {
    uiStore.isDragging = false;
    uiStore.setPan(0, 0);
    return;
  }

  uiStore.isDragging = true;
};

const handleMouseMove = (event) => {
  const svgElement = fieldLinesRef.value?.svgElement;
  const ctm = svgElement?.getScreenCTM?.();
  if (svgElement && ctm) {
    const point = svgElement.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgP = point.matrixTransform(ctm.inverse());

    if (svgP.x < 120 || svgP.x > 1120 || svgP.y < 20 || svgP.y > 720) {
      cursorX.value = null;
      cursorY.value = null;
    } else {
      cursorX.value = ((svgP.x - 120) / 10).toFixed(1);
      cursorY.value = ((svgP.y - 20) / 10).toFixed(1);
    }
  } else {
    cursorX.value = null;
    cursorY.value = null;
  }

  if (!uiStore.isDragging || uiStore.zoomLevel <= 1) {
    return;
  }

  const nextX = uiStore.panX + event.movementX;
  const nextY = uiStore.panY + event.movementY;
  const clamped = clampPan(nextX, nextY);
  uiStore.setPan(clamped.x, clamped.y);
};

const handleMouseUp = () => {
  uiStore.isDragging = false;
};

const handleMouseLeave = () => {
  uiStore.isDragging = false;
  cursorX.value = null;
  cursorY.value = null;
};

const handleWheel = (event) => {
  if (event.deltaY === 0) {
    return;
  }

  const z0 = uiStore.zoomLevel;
  const panX0 = uiStore.panX;
  const panY0 = uiStore.panY;
  const el = fieldRef.value;
  if (!el) {
    return;
  }

  // Measure before zoom changes so center matches current scale.
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (event.deltaY < 0) {
    uiStore.zoomIn();
  } else {
    uiStore.zoomOut();
  }

  const z1 = uiStore.zoomLevel;
  if (z1 === z0) {
    return;
  }

  const ratio = z1 / z0;
  const dx = (event.clientX - cx) * (1 - ratio);
  const dy = (event.clientY - cy) * (1 - ratio);
  const clamped = clampPan(panX0 + dx, panY0 + dy);
  uiStore.setPan(clamped.x, clamped.y);
};

const fieldCursor = computed(() => {
  if (uiStore.zoomLevel <= 1) {
    return 'default';
  }

  return uiStore.isDragging ? 'grabbing' : 'grab';
});

const fieldStyles = computed(() => ({
  transform: `translate(${uiStore.panX}px, ${uiStore.panY}px) scale(${uiStore.zoomLevel})`,
  cursor: fieldCursor.value,
}));

watch(
  () => uiStore.zoomLevel,
  () => {
    const clamped = clampPan(uiStore.panX, uiStore.panY);
    uiStore.setPan(clamped.x, clamped.y);

    if (uiStore.zoomLevel <= 1) {
      uiStore.isDragging = false;
    }
  }
);
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
  user-select: none;
}

.rugby-field-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
}

.is-dragging {
  transition: none !important;
}

.cursor-coordinates {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(15, 23, 42, 0.78);
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  pointer-events: none;
}
</style>
