import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    isRightSidebarOpen: true,
    isTimelineOpen: true,
  }),
  actions: {
    toggleRightSidebar() {
      this.isRightSidebarOpen = !this.isRightSidebarOpen;
    },
    toggleTimeline() {
      this.isTimelineOpen = !this.isTimelineOpen;
    },
  },
});
