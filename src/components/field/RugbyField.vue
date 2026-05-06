<template>
  <div class="rugby-field" />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.rugby-field {
  width: 100%;
  max-height: 100%;
  aspect-ratio: 100 / 70;
  background-color: $field-green;
}
</style>
