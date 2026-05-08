<template>
  <div class="ball-chip" :style="{ backgroundColor: ball.color }" aria-label="Ball" />
</template>

<script setup>
defineProps({
  ball: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.ball-chip {
  width: 16px;
  height: 24px;
  border: 2px solid #000000;
  border-radius: 50%;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
</style>
