<template>
  <div
    class="ball-chip"
    :class="{
      'is-dragging': ball.isDragging,
      'is-linked': isLinked,
    }"
    :style="{
      backgroundColor: ball.color,
      width: width ? width + 'px' : '100%',
      height: height ? height + 'px' : '100%',
      filter: isLinked ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))' : undefined,
    }"
    aria-label="Ball"
    @dblclick="returnToBench"
  />
</template>

<script setup>
import { computed } from 'vue';
import { usePlayStore } from "@/stores/playStore";

const props = defineProps({
  ball: {
    type: Object,
    required: true,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
});

const playStore = usePlayStore();

/**
 * Whether this ball is linked to a player.
 * @returns {boolean}
 */
const isLinked = computed(() => !!playStore.ball.linkedTo);

/**
 * Returns the ball to the bench.
 */
const returnToBench = () => {
  playStore.returnToBench("ball", props.ball.id);
};
</script>

<style lang="scss" scoped>
.ball-chip {
  pointer-events: auto;
  border: 2px solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.ball-chip.is-dragging {
  transform: scale(1.2);
}
</style>
