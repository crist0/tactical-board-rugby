<template>
  <div class="right-sidebar">
    <section class="bench-section">
      <h3 class="section-title">Team A Bench</h3>
      <div class="bench-grid">
        <Player v-for="player in teamABenchPlayers" :key="player.id" :player="player" />
      </div>
    </section>

    <section class="bench-section">
      <h3 class="section-title">Team B Bench</h3>
      <div class="bench-grid">
        <Player v-for="player in teamBBenchPlayers" :key="player.id" :player="player" />
      </div>
    </section>

    <section class="bench-section">
      <h3 class="section-title">Ball</h3>
      <div class="ball-slot">
        <Ball :ball="playStore.ball" />
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
</style>
