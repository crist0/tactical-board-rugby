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
    toggleRightSidebar() {
      this.isRightSidebarOpen = !this.isRightSidebarOpen;
    },
    toggleTimeline() {
      this.isTimelineOpen = !this.isTimelineOpen;
    },
    toggleGrid() {
      this.showGrid = !this.showGrid;
    },
    setPlayerSize(size) {
      this.playerSize = size;
    },
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
    },
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
    },
    resetZoom() {
      this.zoomLevel = 1.0;
      this.panX = 0;
      this.panY = 0;
    },
    setPan(x, y) {
      this.panX = x;
      this.panY = y;
    },
  },
});
