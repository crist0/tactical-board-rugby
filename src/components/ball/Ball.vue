<template>
  <div class="ball-chip" :style="{ backgroundColor: ball.color }" aria-label="Ball" @dblclick="returnToBench" />
</template>

<script setup>
import { usePlayStore } from "@/stores/playStore";

const props = defineProps({
  ball: {
    type: Object,
    required: true,
  },
});

const playStore = usePlayStore();

/**
 * Returns the ball to the bench.
 */
const returnToBench = () => {
  playStore.returnToBench("ball", props.ball.id);
};
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
  transition: all 0.2s ease;
}
</style>
