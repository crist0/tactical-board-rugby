<template>
  <div
    ref="fieldRef"
    class="rugby-field"
    :class="{ 'is-dragging': uiStore.isDragging }"
    :style="fieldStyles"
    @mousedown.prevent="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @wheel.prevent="handleWheel"
  >
    <FieldLines />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import FieldLines from '@/components/field/FieldLines.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const fieldRef = ref(null);

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

.is-dragging {
  transition: none !important;
}
</style>
