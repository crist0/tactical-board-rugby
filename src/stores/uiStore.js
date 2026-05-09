import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isRightSidebarOpen: true,
    isTimelineOpen: true,
    showGrid: false,
    playerSize: 3,
    zoomLevel: 1.0,
    minZoom: 1.0,
    maxZoom: 3.0,
    zoomStep: 0.25,
    panX: 0,
    panY: 0,
    isDragging: false,
  }),
  actions: {
    /**
     * Toggles the visibility of the right sidebar.
     */
    toggleRightSidebar() {
      this.isRightSidebarOpen = !this.isRightSidebarOpen;
    },
    /**
     * Toggles the visibility of the timeline.
     */
    toggleTimeline() {
      this.isTimelineOpen = !this.isTimelineOpen;
    },
    /**
     * Toggles the visibility of the grid.
     */
    toggleGrid() {
      this.showGrid = !this.showGrid;
    },
    /**
     * Sets the size of the players.
     * @param {number} size - The new size for the players.
     */
    setPlayerSize(size) {
      this.playerSize = size;
    },
    /**
     * Zooms in the view.
     */
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
    },
    /**
     * Zooms out the view.
     */
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
    },
    /**
     * Resets the zoom and pan to their default values.
     */
    resetZoom() {
      this.zoomLevel = 1.0;
      this.panX = 0;
      this.panY = 0;
    },
    /**
     * Sets the pan values.
     * @param {number} x - The new x-coordinate for the pan.
     * @param {number} y - The new y-coordinate for the pan.
     */
    setPan(x, y) {
      this.panX = x;
      this.panY = y;
    },
  },
});
