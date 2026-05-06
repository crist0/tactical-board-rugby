import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isRightSidebarOpen: true,
    isTimelineOpen: true,
    zoomLevel: 1.0,
    minZoom: 1.0,
    maxZoom: 3.0,
    zoomStep: 0.25,
  }),
  actions: {
    toggleRightSidebar() {
      this.isRightSidebarOpen = !this.isRightSidebarOpen;
    },
    toggleTimeline() {
      this.isTimelineOpen = !this.isTimelineOpen;
    },
    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + this.zoomStep, this.maxZoom);
    },
    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - this.zoomStep, this.minZoom);
    },
    resetZoom() {
      this.zoomLevel = 1.0;
    },
  },
});
