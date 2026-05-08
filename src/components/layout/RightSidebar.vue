<template>
  <div class="right-sidebar">
    <section class="bench-section">
      <h3 class="section-title">Team A Bench</h3>
      <div class="bench-grid">
        <div
          v-for="player in teamABenchPlayers"
          :key="player.id"
          class="bench-item bench-item--player"
          draggable="true"
          @dragstart="handleDragStart($event, player, 'player')"
        >
          <Player :player="player" />
        </div>
      </div>
    </section>

    <section class="bench-section">
      <h3 class="section-title">Team B Bench</h3>
      <div class="bench-grid">
        <div
          v-for="player in teamBBenchPlayers"
          :key="player.id"
          class="bench-item bench-item--player"
          draggable="true"
          @dragstart="handleDragStart($event, player, 'player')"
        >
          <Player :player="player" />
        </div>
      </div>
    </section>

    <section v-if="showBenchBall" class="bench-section">
      <h3 class="section-title">Ball</h3>
      <div class="ball-slot">
        <div class="bench-item bench-item--ball" draggable="true" @dragstart="handleDragStart($event, playStore.ball, 'ball')">
          <Ball :ball="playStore.ball" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import Player from '@/components/players/Player.vue';
import Ball from '@/components/ball/Ball.vue';
import { usePlayStore } from '@/stores/playStore';

const playStore = usePlayStore();

const teamABenchPlayers = computed(() =>
  playStore.players.filter((player) => player.team === 'A' && player.location === 'bench')
);

const teamBBenchPlayers = computed(() =>
  playStore.players.filter((player) => player.team === 'B' && player.location === 'bench')
);

const showBenchBall = computed(() => playStore.ball.location !== 'field');

const handleDragStart = (event, item, type) => {
  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      id: item.id,
      type,
    })
  );

  // Create a clean clone for the drag image
  const dragImage = event.target.cloneNode(true);
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px'; // Position off-screen
  dragImage.style.background = 'transparent';
  document.body.appendChild(dragImage);

  // Set the custom drag image
  event.dataTransfer.setDragImage(dragImage, event.target.offsetWidth / 2, event.target.offsetHeight / 2);

  // Clean up the cloned element
  setTimeout(() => {
    document.body.removeChild(dragImage);
  }, 0);
};
</script>

<style lang="scss" scoped>
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: #fff3db;
  color: #7a4b00;
  padding: 14px 12px;
  overflow-y: auto;
}

.bench-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  margin: 0;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.03em;
}

.bench-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  justify-items: center;
}

.ball-slot {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bench-item {
  cursor: grab;
  background: transparent !important;
  border: none;
  padding: 0;
  border-radius: 50%;
}

.bench-item--player {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
}

.bench-item--ball {
  width: 18px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
}
</style>
