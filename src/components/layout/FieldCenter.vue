<template>
  <div class="field-center">
    <RugbyField class="field-surface" />
  </div>
</template>

<script setup>
import RugbyField from '@/components/field/RugbyField.vue';
</script>

<style lang="scss" scoped>
.field-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

.field-surface {
  max-width: 100%;
  max-height: 100%;
}
</style>
