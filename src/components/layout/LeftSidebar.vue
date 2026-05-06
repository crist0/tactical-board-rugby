<template>
  <div class="left-sidebar">
    <div class="tools-title">Tools</div>
    <ZoomControls class="zoom-controls-slot" />
  </div>
</template>

<script setup>
import ZoomControls from '@/components/controls/ZoomControls.vue';
</script>

<style lang="scss" scoped>
.left-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #e9f2ff;
  color: #1c3d6e;
  padding: 16px 12px;
  gap: 12px;
}

.tools-title {
  font-weight: 700;
  letter-spacing: 0.03em;
}

.zoom-controls-slot {
  margin-top: auto;
  align-self: center;
}
</style>
