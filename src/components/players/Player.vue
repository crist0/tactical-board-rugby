<template>
  <div class="player-chip" :style="{ backgroundColor: player.color }" :aria-label="`Player ${player.team}${player.number}`">
    <span class="player-number">{{ player.number }}</span>
  </div>
</template>

<script setup>
defineProps({
  player: {
    type: Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.player-chip {
  width: 28px;
  height: 28px;
  border: 2px solid #000000;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  flex-shrink: 0;
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
