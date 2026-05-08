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
  width: 100%;
  height: 100%;
  border: 2px solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
}
</style>
