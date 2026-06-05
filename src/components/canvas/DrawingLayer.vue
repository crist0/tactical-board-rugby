<template>
  <g
    ref="svgGroupRef"
    class="drawing-layer"
    :style="svgPointerStyles"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!--
      Invisible hit-area rect that covers the entire SVG viewBox (1240x740).
      Without it, an empty <g> cannot receive mousedown events because it has no
      intrinsic clickable area. This rect makes the entire field clickable for drawing.
    -->
    <rect
      x="0"
      y="0"
      width="1240"
      height="740"
      fill="transparent"
      pointer-events="all"
    />

    <!-- Arrowhead marker definitions -->
    <defs>
      <marker
        v-for="d in arrowheadDrawings"
        :key="`arrow-${d.id}`"
        :id="`arrow-${d.id}`"
        viewBox="0 0 10 10"
        refX="8"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" :fill="d.color" />
      </marker>
    </defs>

    <!-- Render all persisted drawings -->
    <template v-for="d in playStore.drawings" :key="d.id">
      <!-- Pencil strokes -->
      <polyline
        v-if="d.type === 'pencil'"
        :points="d.points.map((p) => `${p.x},${p.y}`).join(' ')"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :marker-end="d.withArrowhead ? `url(#arrow-${d.id})` : undefined"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
      <!-- Straight lines -->
      <line
        v-if="d.type === 'line'"
        :x1="d.startX"
        :y1="d.startY"
        :x2="d.endX"
        :y2="d.endY"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        stroke-linecap="round"
        :marker-end="d.withArrowhead ? `url(#arrow-${d.id})` : undefined"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
      <!-- Rectangle -->
      <rect
        v-if="d.type === 'rectangle'"
        :x="Math.min(d.startX, d.endX)"
        :y="Math.min(d.startY, d.endY)"
        :width="Math.abs(d.startX - d.endX)"
        :height="Math.abs(d.startY - d.endY)"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        fill="transparent"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
      <!-- Circle -->
      <ellipse
        v-if="d.type === 'circle'"
        :cx="(d.startX + d.endX) / 2"
        :cy="(d.startY + d.endY) / 2"
        :rx="Math.abs(d.startX - d.endX) / 2"
        :ry="Math.abs(d.startY - d.endY) / 2"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        fill="transparent"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
      <!-- Triangle (isosceles pointing up) -->
      <polygon
        v-if="d.type === 'triangle'"
        :points="trianglePoints(d)"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        fill="transparent"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
      <!-- Curve (Quadratic Bezier) -->
      <path
        v-if="d.type === 'curve'"
        :d="`M ${d.startX} ${d.startY} Q ${d.controlX} ${d.controlY} ${d.endX} ${d.endY}`"
        :stroke="d.color"
        :stroke-width="d.width"
        :opacity="d.opacity"
        fill="transparent"
        stroke-linecap="round"
        stroke-linejoin="round"
        :marker-end="d.withArrowhead ? `url(#arrow-${d.id})` : undefined"
        :class="eraserHoverClass"
        :style="eraserShapeStyles"
        :pointer-events="eraserPointerEvents"
        @click.stop="onShapeClick(d.id)"
      />
    </template>

    <!-- Live preview of the stroke currently being drawn -->
    <!-- Pencil preview -->
    <polyline
      v-if="currentDrawing && currentDrawing.type === 'pencil'"
      :points="currentDrawing.points.map((p) => `${p.x},${p.y}`).join(' ')"
      :stroke="currentDrawing.color"
      :stroke-width="currentDrawing.width"
      :opacity="currentDrawing.opacity"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Line preview -->
    <line
      v-if="currentDrawing && currentDrawing.type === 'line'"
      :x1="currentDrawing.startX"
      :y1="currentDrawing.startY"
      :x2="currentDrawing.endX"
      :y2="currentDrawing.endY"
      :stroke="currentDrawing.color"
      :stroke-width="currentDrawing.width"
      :opacity="currentDrawing.opacity"
      stroke-linecap="round"
    />
    <!-- Rectangle preview -->
    <rect
      v-if="currentDrawing && currentDrawing.type === 'rectangle'"
      :x="Math.min(currentDrawing.startX, currentDrawing.endX)"
      :y="Math.min(currentDrawing.startY, currentDrawing.endY)"
      :width="Math.abs(currentDrawing.startX - currentDrawing.endX)"
      :height="Math.abs(currentDrawing.startY - currentDrawing.endY)"
      :stroke="currentDrawing.color"
      :stroke-width="currentDrawing.width"
      :opacity="currentDrawing.opacity"
      fill="transparent"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Circle preview -->
    <ellipse
      v-if="currentDrawing && currentDrawing.type === 'circle'"
      :cx="(currentDrawing.startX + currentDrawing.endX) / 2"
      :cy="(currentDrawing.startY + currentDrawing.endY) / 2"
      :rx="Math.abs(currentDrawing.startX - currentDrawing.endX) / 2"
      :ry="Math.abs(currentDrawing.startY - currentDrawing.endY) / 2"
      :stroke="currentDrawing.color"
      :stroke-width="currentDrawing.width"
      :opacity="currentDrawing.opacity"
      fill="transparent"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Triangle preview -->
    <polygon
      v-if="currentDrawing && currentDrawing.type === 'triangle'"
      :points="trianglePoints(currentDrawing)"
      :stroke="currentDrawing.color"
      :stroke-width="currentDrawing.width"
      :opacity="currentDrawing.opacity"
      fill="transparent"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Curve 3-click previews -->
    <!-- Step 1→2: straight line from start to current mouse position -->
    <line
      v-if="curveStep === 1 && curveMousePos"
      :x1="curveStartX"
      :y1="curveStartY"
      :x2="curveMousePos.x"
      :y2="curveMousePos.y"
      :stroke="drawingStore.strokeColor"
      :stroke-width="drawingStore.strokeWidth"
      :opacity="drawingStore.strokeOpacity"
      stroke-linecap="round"
      :stroke-dasharray="'6,4'"
    />
    <!-- Step 2→3: quadratic bezier preview -->
    <path
      v-if="curveStep === 2 && curveMousePos"
      :d="`M ${curveStartX} ${curveStartY} Q ${curveMousePos.x} ${curveMousePos.y} ${curveEndX} ${curveEndY}`"
      :stroke="drawingStore.strokeColor"
      :stroke-width="drawingStore.strokeWidth"
      :opacity="drawingStore.strokeOpacity"
      fill="transparent"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke-dasharray="'6,4'"
    />
  </g>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { usePlayStore } from '@/stores/playStore';
import { useDrawingStore } from '@/stores/drawingStore';
import { useHistoryStore } from '@/stores/historyStore';

const playStore = usePlayStore();
const drawingStore = useDrawingStore();
const historyStore = useHistoryStore();

const svgGroupRef = ref(null);
const isDrawing = ref(false);
const currentDrawing = ref(null);

// --- Curve 3-click state machine ---
const curveStep = ref(0);        // 0=idle, 1=start-set, 2=end-set
const curveStartX = ref(0);
const curveStartY = ref(0);
const curveEndX = ref(0);
const curveEndY = ref(0);
const curveMousePos = ref(null); // temporary mouse position for preview

/**
 * Resets the curve state machine back to idle.
 */
const resetCurveState = () => {
  curveStep.value = 0;
  curveStartX.value = 0;
  curveStartY.value = 0;
  curveEndX.value = 0;
  curveEndY.value = 0;
  curveMousePos.value = null;
};

// Reset curve state when tool changes away from 'curve'
watch(
  () => drawingStore.activeTool,
  (newTool) => {
    if (newTool !== 'curve') {
      resetCurveState();
    }
  }
);

// --- Helpers ---

/**
 * Generates a simple unique ID for each drawing.
 * Uses Date.now() combined with a random suffix for basic uniqueness.
 * @returns {string}
 */
const generateId = () => `drawing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Converts a mouse event's clientX/clientY into SVG viewBox coordinates
 * by using the SVG's ScreenCTM matrix. This correctly handles zoom/pan
 * since the <g> lives inside the pannable/zoomable SVG.
 * @param {MouseEvent} event
 * @returns {{ x: number, y: number } | null}
 */
const getSvgPoint = (event) => {
  // Find the root <svg> element from the event target
  const svg = (event.target instanceof SVGSVGElement)
    ? event.target
    : event.target?.closest?.('svg');
  if (!svg) return { x: 0, y: 0 };

  // Use DOMPoint for broader browser compatibility
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };

  const pt = new DOMPoint(event.clientX, event.clientY);
  const svgPoint = pt.matrixTransform(ctm.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
};

/**
 * Computes triangle points string from a drawing object.
 * Renders an isosceles triangle pointing upward within the bounding box.
 * @param {{ startX: number, startY: number, endX: number, endY: number }} d
 * @returns {string}
 */
const trianglePoints = (d) => {
  const minX = Math.min(d.startX, d.endX);
  const maxX = Math.max(d.startX, d.endX);
  const minY = Math.min(d.startY, d.endY);
  const maxY = Math.max(d.startY, d.endY);
  const midX = (minX + maxX) / 2;
  return `${midX},${minY} ${minX},${maxY} ${maxX},${maxY}`;
};

// --- Dynamic pointer-events ---

/**
 * When the active tool is 'cursor', disable pointer events on the layer
 * so that players/ball can be dragged through the foreignObject elements
 * that are rendered on top.
 */
const svgPointerStyles = computed(() => {
  if (drawingStore.activeTool === 'cursor') {
    return { pointerEvents: 'none' };
  }
  return { pointerEvents: 'auto' };
});

// --- Arrowhead marker drawings ---

/**
 * Returns only the drawings that have withArrowhead enabled.
 * These will have <marker> definitions rendered in the <defs>.
 * @returns {Array}
 */
const arrowheadDrawings = computed(() => {
  return playStore.drawings.filter((d) => d.withArrowhead);
});

// --- Eraser shape interaction ---

const isEraser = computed(() => drawingStore.activeTool === 'eraser');

/**
 * CSS class applied to each rendered shape when eraser is active,
 * enabling hover effects.
 */
const eraserHoverClass = computed(() => (isEraser.value ? 'eraser-target' : ''));

/**
 * Inline styles applied to each rendered shape when eraser is active.
 * The hover effect (red stroke, reduced opacity) is handled via CSS.
 */
const eraserShapeStyles = computed(() => {
  if (isEraser.value) {
    return { cursor: 'crosshair' };
  }
  return {};
});

/**
 * Pointer events on shapes: when eraser is active, make the stroke
 * itself clickable even if the stroke is transparent or very thin.
 */
const eraserPointerEvents = computed(() => {
  return isEraser.value ? 'visibleStroke' : 'none';
});

// --- Shape click handler (Eraser) ---

/**
 * Handles clicking on an existing shape.
 * If the eraser tool is active, saves history state, then removes the drawing.
 * @param {string} id - The drawing ID to remove.
 */
const onShapeClick = async (id) => {
  if (drawingStore.activeTool !== 'eraser') return;

  await historyStore.saveState();
  playStore.removeDrawing(id);
};

// --- Mouse drawing handlers ---

/**
 * The set of tools that trigger drawing actions in onMouseDown.
 * Pencil and line are drag-to-draw; rectangle, circle, triangle are drag-shape;
 * curve uses a 3-click state machine.
 */
const drawingTools = ['pencil', 'line', 'rectangle', 'circle', 'triangle', 'curve'];

/**
 * Handles mousedown on the SVG layer.
 * For pencil/line/shape tools: saves history state, creates a new drawing object.
 * For curve: manages the 3-click state machine.
 */
const onMouseDown = async (event) => {
  const tool = drawingStore.activeTool;
  if (!drawingTools.includes(tool)) return;
  // Only respond to left mouse button
  if (event.button !== 0) return;

  // Stop propagation so the SVG's pan handler (handleMouseDown in RugbyField.vue)
  // does not start dragging the view while drawing
  event.stopPropagation();

  const pt = getSvgPoint(event);

  // --- Curve 3-click state machine ---
  if (tool === 'curve') {
    if (curveStep.value === 0) {
      // First click: record start point
      curveStartX.value = pt.x;
      curveStartY.value = pt.y;
      curveStep.value = 1;
      curveMousePos.value = { x: pt.x, y: pt.y };
      return;
    }
    if (curveStep.value === 1) {
      // Second click: record end point
      curveEndX.value = pt.x;
      curveEndY.value = pt.y;
      curveStep.value = 2;
      curveMousePos.value = { x: pt.x, y: pt.y };
      return;
    }
    if (curveStep.value === 2) {
      // Third click: save control point, persist drawing, reset
      const id = generateId();
      const drawing = {
        id,
        type: 'curve',
        color: drawingStore.strokeColor,
        width: drawingStore.strokeWidth,
        opacity: drawingStore.strokeOpacity,
        withArrowhead: drawingStore.withArrowhead,
        startX: curveStartX.value,
        startY: curveStartY.value,
        endX: curveEndX.value,
        endY: curveEndY.value,
        controlX: pt.x,
        controlY: pt.y,
      };
      await historyStore.saveState();
      playStore.addDrawing(drawing);
      resetCurveState();
      return;
    }
  }

  // --- Save undo state BEFORE any mutation (Memento pattern) ---
  await historyStore.saveState();

  isDrawing.value = true;

  if (tool === 'pencil') {
    const id = generateId();
    currentDrawing.value = {
      id,
      type: 'pencil',
      color: drawingStore.strokeColor,
      width: drawingStore.strokeWidth,
      opacity: drawingStore.strokeOpacity,
      withArrowhead: drawingStore.withArrowhead,
      points: [{ x: pt.x, y: pt.y }],
    };
    playStore.addDrawing(currentDrawing.value);
  } else if (tool === 'line') {
    const id = generateId();
    currentDrawing.value = {
      id,
      type: 'line',
      color: drawingStore.strokeColor,
      width: drawingStore.strokeWidth,
      opacity: drawingStore.strokeOpacity,
      withArrowhead: drawingStore.withArrowhead,
      startX: pt.x,
      startY: pt.y,
      endX: pt.x,
      endY: pt.y,
    };
    playStore.addDrawing(currentDrawing.value);
  } else if (tool === 'rectangle' || tool === 'circle' || tool === 'triangle') {
    const id = generateId();
    currentDrawing.value = {
      id,
      type: tool,
      color: drawingStore.strokeColor,
      width: drawingStore.strokeWidth,
      opacity: drawingStore.strokeOpacity,
      startX: pt.x,
      startY: pt.y,
      endX: pt.x,
      endY: pt.y,
    };
    playStore.addDrawing(currentDrawing.value);
  }
};

/**
 * Handles mousemove on the SVG layer while drawing.
 * Updates the current drawing's points (pencil) or endpoint (line/shapes).
 * Also updates curve preview position.
 */
const onMouseMove = (event) => {
  const tool = drawingStore.activeTool;
  const pt = getSvgPoint(event);

  // Update curve preview mouse position
  if (tool === 'curve' && (curveStep.value === 1 || curveStep.value === 2)) {
    curveMousePos.value = { x: pt.x, y: pt.y };
  }

  if (!isDrawing.value || !currentDrawing.value) return;

  const drawingType = currentDrawing.value.type;

  if (drawingType === 'pencil') {
    const points = currentDrawing.value.points;
    points.push({ x: pt.x, y: pt.y });
    // Update the store so snapshots always reflect the latest state
    playStore.updateDrawing(currentDrawing.value.id, { points: [...points] });
  } else if (drawingType === 'line' || drawingType === 'rectangle' || drawingType === 'circle' || drawingType === 'triangle') {
    currentDrawing.value.endX = pt.x;
    currentDrawing.value.endY = pt.y;
    playStore.updateDrawing(currentDrawing.value.id, {
      endX: pt.x,
      endY: pt.y,
    });
  }
};

/**
 * Handles mouseup and mouseleave — finalizes the current drawing.
 */
const onMouseUp = () => {
  if (!isDrawing.value) return;
  isDrawing.value = false;
  currentDrawing.value = null;
};

// --- ESC key handler to reset curve state ---
const onKeyDown = (event) => {
  if (event.key === 'Escape') {
    resetCurveState();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
/*
 * When eraser is active, any shape with the .eraser-target class
 * will show a red hover effect so the user knows WHICH shape will be deleted.
 */
.eraser-target {
  transition: stroke 0.15s ease, opacity 0.15s ease;
}

.eraser-target:hover {
  stroke: red !important;
  opacity: 0.5 !important;
}
</style>