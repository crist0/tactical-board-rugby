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
    >
      <svg
        ref="svgRef"
        class="field-svg"
        viewBox="0 0 1240 740"
        @mousedown.prevent="handleMouseDown"
        @dragover.prevent
        @drop="handleDrop"
      >
        <FieldLines />
        <FieldGrid />
        <g id="field-elements">
          <foreignObject
            v-for="item in fieldPlayers"
            :key="item.id"
            :x="item.x - playerSizeInUnits.width / 2"
            :y="item.y - playerSizeInUnits.height / 2"
            :width="playerSizeInUnits.width"
            :height="playerSizeInUnits.height"
            @mousedown.stop.prevent="startElementDrag($event, item, 'player')"
          >
            <div class="field-element-wrapper">
              <Player :player="item" />
            </div>
          </foreignObject>

          <foreignObject
            v-if="fieldBall"
            :key="fieldBall.id"
            :x="fieldBall.x - ballSizeInUnits.width / 2"
            :y="fieldBall.y - ballSizeInUnits.height / 2"
            :width="ballSizeInUnits.width"
            :height="ballSizeInUnits.height"
            @mousedown.stop.prevent="startElementDrag($event, fieldBall, 'ball')"
          >
            <div class="field-element-wrapper field-element-wrapper--ball">
              <Ball :ball="fieldBall" />
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
    <div v-if="cursorX !== null && cursorY !== null" class="cursor-coordinates">
      X: {{ cursorX }}m | Y: {{ cursorY }}m
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import FieldLines from '@/components/field/FieldLines.vue';
import FieldGrid from '@/components/field/FieldGrid.vue';
import Player from '@/components/players/Player.vue';
import Ball from '@/components/ball/Ball.vue';
import { usePlayStore } from '@/stores/playStore';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const playStore = usePlayStore();
const fieldRef = ref(null);
const svgRef = ref(null);
const cursorX = ref(null);
const cursorY = ref(null);
const draggedElement = ref(null);
const dragOffset = ref({ x: 0, y: 0 });

/**
 * @returns {{width: number, height: number}} The player size in SVG units.
 */
const playerSizeInUnits = computed(() => {
  const size = uiStore.playerSize * 10;
  return {
    width: size,
    height: size,
  };
});

/**
 * @returns {{width: number, height: number}} The ball size in SVG units.
 */
const ballSizeInUnits = computed(() => {
  const height = uiStore.playerSize * 10;
  return {
    width: height / 1.5,
    height,
  };
});

/**
 * @returns {Array} The players on the field.
 */
const fieldPlayers = computed(() => playStore.players.filter((player) => player.location === 'field'));

/**
 * @returns {object|null} The ball if it is on the field, otherwise null.
 */
const fieldBall = computed(() => (playStore.ball.location === 'field' ? playStore.ball : null));

/**
 * Converts mouse event coordinates to SVG coordinates.
 * @param {MouseEvent} event The mouse event.
 * @returns {DOMPoint|null} The SVG point or null if it cannot be calculated.
 */
const getSvgPointFromEvent = (event) => {
  const svg = svgRef.value;
  const ctm = svg?.getScreenCTM?.();
  if (!svg || !ctm) {
    return null;
  }

  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(ctm.inverse());
};

/**
 * Calculates the maximum pan bounds based on the zoom level.
 * @returns {{maxPanX: number, maxPanY: number}} The maximum pan bounds.
 */
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

/**
 * Clamps the pan values within the allowed bounds.
 * @param {number} x The x-coordinate of the pan.
 * @param {number} y The y-coordinate of the pan.
 * @returns {{x: number, y: number}} The clamped pan coordinates.
 */
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

/**
 * Clamps the element position within the SVG viewbox.
 * @param {number} x The x-coordinate of the element.
 * @param {number} y The y-coordinate of the element.
 * @param {string} itemType The type of the item ('player' or 'ball').
 * @returns {{x: number, y: number}} The clamped element position.
 */
const clampElementPosition = (x, y, itemType) => {
  const svg = svgRef.value;
  if (!svg) {
    return { x, y };
  }
  const viewBox = svg.viewBox.baseVal;

  const itemSize = itemType === 'player' ? playerSizeInUnits.value : ballSizeInUnits.value;
  const halfWidth = itemSize.width / 2;
  const halfHeight = itemSize.height / 2;

  const clampedX = Math.max(viewBox.x + halfWidth, Math.min(x, viewBox.x + viewBox.width - halfWidth));
  const clampedY = Math.max(viewBox.y + halfHeight, Math.min(y, viewBox.y + viewBox.height - halfHeight));

  return { x: clampedX, y: clampedY };
};

/**
 * Handles the mouse down event on the SVG.
 * @param {MouseEvent} event The mouse down event.
 */
const handleMouseDown = (event) => {
  if (uiStore.zoomLevel <= 1) {
    uiStore.isDragging = false;
    uiStore.setPan(0, 0);
    return;
  }

  uiStore.isDragging = true;
};

/**
 * Handles the mouse move event on the field wrapper.
 * @param {MouseEvent} event The mouse move event.
 */
const handleMouseMove = (event) => {
  const svgP = getSvgPointFromEvent(event);
  if (svgP) {
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

  if (draggedElement.value) {
    return;
  }

  if (!uiStore.isDragging || uiStore.zoomLevel <= 1) {
    return;
  }

  const nextX = uiStore.panX + event.movementX;
  const nextY = uiStore.panY + event.movementY;
  const clamped = clampPan(nextX, nextY);
  uiStore.setPan(clamped.x, clamped.y);
};

/**
 * Handles the mouse up event.
 */
const handleMouseUp = () => {
  uiStore.isDragging = false;
  draggedElement.value = null;
};

/**
 * Handles the mouse leave event.
 */
const handleMouseLeave = () => {
  uiStore.isDragging = false;
  cursorX.value = null;
  cursorY.value = null;
};

/**
 * Handles the wheel event for zooming.
 * @param {WheelEvent} event The wheel event.
 */
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

/**
 * Handles the drop event for moving items.
 * @param {DragEvent} event The drop event.
 */
const handleDrop = (event) => {
  const payload = event.dataTransfer?.getData('text/plain');
  if (!payload) {
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return;
  }

  const svgP = getSvgPointFromEvent(event);
  if (!svgP || !parsed?.id || !parsed?.type) {
    return;
  }

  const clamped = clampElementPosition(svgP.x, svgP.y, parsed.type);
  playStore.moveItemToField(parsed.type, parsed.id, clamped.x, clamped.y);
};

/**
 * Starts dragging an element.
 * @param {MouseEvent} event The mouse down event.
 * @param {object} item The item being dragged.
 * @param {string} type The type of the item ('player' or 'ball').
 */
const startElementDrag = (event, item, type) => {
  const svgP = getSvgPointFromEvent(event);
  if (!svgP) {
    return;
  }

  dragOffset.value = {
    x: svgP.x - item.x,
    y: svgP.y - item.y,
  };
  draggedElement.value = {
    id: item.id,
    type,
  };
};

/**
 * Handles the global mouse move event for dragging elements.
 * @param {MouseEvent} event The mouse move event.
 */
const handleGlobalMouseMove = (event) => {
  if (!draggedElement.value) {
    return;
  }

  const svgP = getSvgPointFromEvent(event);
  if (!svgP) {
    return;
  }

  const newX = svgP.x - dragOffset.value.x;
  const newY = svgP.y - dragOffset.value.y;

  const clamped = clampElementPosition(newX, newY, draggedElement.value.type);

  playStore.updateItemPosition(
    draggedElement.value.type,
    draggedElement.value.id,
    clamped.x,
    clamped.y
  );
};

/**
 * Handles the global mouse up event to stop dragging.
 */
const handleGlobalMouseUp = () => {
  draggedElement.value = null;
};

/**
 * @returns {string} The cursor style for the field.
 */
const fieldCursor = computed(() => {
  if (uiStore.zoomLevel <= 1) {
    return 'default';
  }

  return uiStore.isDragging ? 'grabbing' : 'grab';
});

/**
 * @returns {object} The styles for the field element.
 */
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

onMounted(() => {
  window.addEventListener('mousemove', handleGlobalMouseMove);
  window.addEventListener('mouseup', handleGlobalMouseUp);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleGlobalMouseMove);
  window.removeEventListener('mouseup', handleGlobalMouseUp);
});
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

.field-svg {
  width: 100%;
  height: 100%;
  display: block;
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

.field-element-wrapper {
  width: 100%;
  height: 100%;
}

.field-element-wrapper--ball {
  padding: 10%;
  box-sizing: border-box;
}
</style>
