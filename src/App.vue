<template>
  <div class="app-shell" :style="appShellStyles">
    <AppHeader class="header" />
    <LeftSidebar class="left" />
    <FieldCenter class="center" />
    <RightSidebar class="right" />
    <AppFooter class="footer" />

    <button
      class="panel-toggle panel-toggle--right"
      type="button"
      :aria-label="uiStore.isRightSidebarOpen ? 'Close bench panel' : 'Open bench panel'"
      @click="uiStore.toggleRightSidebar"
    >
      <ChevronRight v-if="uiStore.isRightSidebarOpen" :size="20" />
      <ChevronLeft v-else :size="20" />
    </button>

    <button
      class="panel-toggle panel-toggle--bottom"
      type="button"
      :aria-label="uiStore.isTimelineOpen ? 'Close timeline panel' : 'Open timeline panel'"
      @click="uiStore.toggleTimeline"
    >
      <ChevronDown v-if="uiStore.isTimelineOpen" :size="20" />
      <ChevronUp v-else :size="20" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-vue-next';
import AppHeader from '@/components/layout/AppHeader.vue';
import LeftSidebar from '@/components/layout/LeftSidebar.vue';
import FieldCenter from '@/components/layout/FieldCenter.vue';
import RightSidebar from '@/components/layout/RightSidebar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();

const appShellStyles = computed(() => ({
  gridTemplateColumns: `var(--sidebar-left-width) 1fr ${
    uiStore.isRightSidebarOpen ? 'var(--sidebar-right-width)' : '0px'
  }`,
  gridTemplateRows: `var(--header-height) 1fr ${
    uiStore.isTimelineOpen ? 'var(--footer-height)' : '0px'
  }`,
}));
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.app-shell {
  --header-height: #{$header-height};
  --footer-height: #{$footer-height};
  --sidebar-left-width: #{$sidebar-left-width};
  --sidebar-right-width: #{$sidebar-right-width};

  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--sidebar-left-width) 1fr #{$sidebar-right-width};
  grid-template-rows: var(--header-height) 1fr #{$footer-height};
  grid-template-areas:
    'header header header'
    'left center right'
    'footer footer footer';
  transition:
    grid-template-columns 0.3s ease,
    grid-template-rows 0.3s ease;
}

.header {
  grid-area: header;
}

.left {
  grid-area: left;
}

.center {
  grid-area: center;
  min-width: 0;
  min-height: 0;
}

.right {
  grid-area: right;
  overflow: hidden;
}

.footer {
  grid-area: footer;
  overflow: hidden;
}

.panel-toggle {
  position: fixed;
  z-index: 50;
  width: 36px;
  height: 36px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background-color: #ffffff;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
}

.panel-toggle--right {
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

.panel-toggle--bottom {
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
}
</style>
