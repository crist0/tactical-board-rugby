<template>
  <div class="app-shell">
    <AppHeader class="header" />
    <LeftSidebar class="left" />
    <FieldCenter class="center" />
    <RightSidebar class="right" />
    <AppFooter class="footer" />
  </div>
</template>

<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import LeftSidebar from '@/components/layout/LeftSidebar.vue';
import FieldCenter from '@/components/layout/FieldCenter.vue';
import RightSidebar from '@/components/layout/RightSidebar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
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
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-columns: $sidebar-left-width 1fr $sidebar-right-width;
  grid-template-rows: $header-height 1fr $footer-height;
  grid-template-areas:
    'header header header'
    'left center right'
    'footer footer footer';
}

.header {
  grid-area: header;
}

.left {
  grid-area: left;
}

.center {
  grid-area: center;
}

.right {
  grid-area: right;
}

.footer {
  grid-area: footer;
}
</style>
