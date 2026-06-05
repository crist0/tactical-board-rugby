import { defineStore } from 'pinia';

export const useDrawingStore = defineStore('drawing', {
  state: () => ({
    /** @type {'cursor'|'pencil'|'line'|'curve'|'rectangle'|'circle'|'triangle'|'eraser'} */
    activeTool: 'cursor',
    /** @type {string} Hex color for the stroke */
    strokeColor: '#FF0000',
    /** @type {number} Stroke width in pixels (1–10) */
    strokeWidth: 3,
    /** @type {number} Stroke opacity (0.1–1.0) */
    strokeOpacity: 1.0,
    /** @type {boolean} Whether to draw an arrowhead (pencil, line, curve only) */
    withArrowhead: false,
  }),

  getters: {
    /**
     * Returns true when the arrowhead toggle should be visible.
     * Only relevant for pencil, line, and curve tools.
     * @returns {boolean}
     */
    canUseArrowhead() {
      return ['pencil', 'line', 'curve'].includes(this.activeTool);
    },
  },

  actions: {
    /**
     * Sets the active drawing tool.
     * @param {'cursor'|'pencil'|'line'|'curve'|'rectangle'|'circle'|'triangle'|'eraser'} tool
     */
    setTool(tool) {
      this.activeTool = tool;
    },

    /**
     * Sets the stroke color.
     * @param {string} color - A valid hex color string.
     */
    setColor(color) {
      this.strokeColor = color;
    },

    /**
     * Sets the stroke width.
     * @param {number} width - Must be between 1 and 10.
     */
    setWidth(width) {
      this.strokeWidth = Math.max(1, Math.min(10, width));
    },

    /**
     * Sets the stroke opacity.
     * @param {number} opacity - Must be between 0.1 and 1.0.
     */
    setOpacity(opacity) {
      this.strokeOpacity = Math.max(0.1, Math.min(1.0, opacity));
    },

    /**
     * Toggles the arrowhead option on or off.
     */
    toggleArrowhead() {
      this.withArrowhead = !this.withArrowhead;
    },

    /**
     * Clears all drawings from the playStore.
     * Uses lazy import to avoid circular dependency at module evaluation time.
     * @returns {Promise<void>}
     */
    async clearDrawings() {
      const { usePlayStore } = await import('@/stores/playStore');
      const playStore = usePlayStore();
      playStore.clearDrawings();
    },
  },
});