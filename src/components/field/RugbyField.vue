<template>
  <div class="rugby-field">
    <FieldLines />
  </div>
</template>

<script setup>
import FieldLines from '@/components/field/FieldLines.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.rugby-field {
  position: relative;
  width: 100%;
  max-height: 100%;
  aspect-ratio: 124 / 74;
  background-color: $field-green;
}
</style>
