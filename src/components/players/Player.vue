<template>
  <div
    class="player-chip"
    :class="{
      'is-dragging': player.isDragging,
      'is-highlighted': isHighlighted,
      'is-linked': isLinked,
    }"
    :style="{
      backgroundColor: player.color,
      width: size ? size + 'px' : '100%',
      height: size ? size + 'px' : '100%',
      filter: isHighlighted || isLinked ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))' : undefined,
    }"
    :aria-label="`Player ${player.team}${player.number}`"
    @dblclick="returnToBench"
  >
    <span class="player-number">{{ player.number }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlayStore } from "@/stores/playStore";

const props = defineProps({
  player: {
    type: Object,
    required: true,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: null,
  },
});

const playStore = usePlayStore();

/**
 * Whether this player is linked to the ball.
 * @returns {boolean}
 */
const isLinked = computed(() => playStore.ball.linkedTo === props.player.id);

/**
 * Returns the player to the bench.
 */
const returnToBench = () => {
  playStore.returnToBench("player", props.player.id);
};
</script>

<style lang="scss" scoped>
.player-chip {
  pointer-events: auto;
  border: 2px solid #000000;
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.player-chip.is-dragging {
  transform: scale(1.2);
}

.player-chip.is-highlighted {
  transform: scale(1.15);
}

.player-number {
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}
</style>
