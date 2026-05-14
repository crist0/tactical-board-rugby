<template>
  <div class="right-sidebar">
    <section class="bench-section">
      <div class="section-header">
        <h3 class="section-title">Team A Bench</h3>
        <input
          type="color"
          :value="playStore.teamAColor"
          @input="updateTeamColor('A', $event.target.value)"
        />
      </div>
      <div class="bench-grid">
        <div
          v-for="player in teamAPlayers"
          :key="player.id"
          :class="['bench-item', 'bench-item--player', { 'is-ghost': player.location === 'field' }]"
          :draggable="player.location !== 'field'"
          @dragstart="handleDragStart($event, player, 'player')"
          @dblclick="handleDoubleClick(player, 'player')"
        >
          <Player :player="player" />
        </div>
      </div>
    </section>

    <section class="bench-section">
      <div class="section-header">
        <h3 class="section-title">Team B Bench</h3>
        <input
          type="color"
          :value="playStore.teamBColor"
          @input="updateTeamColor('B', $event.target.value)"
        />
      </div>
      <div class="bench-grid">
        <div
          v-for="player in teamBPlayers"
          :key="player.id"
          :class="['bench-item', 'bench-item--player', { 'is-ghost': player.location === 'field' }]"
          :draggable="player.location !== 'field'"
          @dragstart="handleDragStart($event, player, 'player')"
          @dblclick="handleDoubleClick(player, 'player')"
        >
          <Player :player="player" />
        </div>
      </div>
    </section>

    <section class="bench-section">
      <h3 class="section-title">Ball</h3>
      <div class="ball-slot">
        <div 
          :class="['bench-item', 'bench-item--ball', { 'is-ghost': playStore.ball.location === 'field' }]"
          :draggable="playStore.ball.location !== 'field'"
          @dragstart="handleDragStart($event, playStore.ball, 'ball')"
          @dblclick="handleDoubleClick(playStore.ball, 'ball')"
        >
          <Ball :ball="playStore.ball" />
        </div>
      </div>
    </section>

    <section class="reset-section">
      <div v-if="showConfirmReset" class="reset-confirm">
        <p>Are you sure?</p>
        <button @click="confirmReset(true)" class="confirm-btn confirm-btn--yes">Yes</button>
        <button @click="confirmReset(false)" class="confirm-btn confirm-btn--no">No</button>
      </div>
      <button v-else @click="handleResetClick" class="reset-btn">Reset Board</button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import Player from "@/components/players/Player.vue";
import Ball from "@/components/ball/Ball.vue";
import { usePlayStore } from "@/stores/playStore";

const playStore = usePlayStore();
const showConfirmReset = ref(false);

/**
 * @returns {Array} The players of team A.
 */
const teamAPlayers = computed(() =>
  playStore.players.filter((player) => player.team === "A")
);

/**
 * @returns {Array} The players of team B.
 */
const teamBPlayers = computed(() =>
  playStore.players.filter((player) => player.team === 'B')
);


/**
 * Updates the color for a specified team.
 * @param {'A' | 'B'} team - The team to update ('A' or 'B').
 * @param {string} color - The new hex color code.
 */
const updateTeamColor = (team, color) => {
  playStore.updateTeamColor(team, color);
};

/**
 * Handles the drag start event for an item.
 * Creates a custom drag image and passes item data to the drop zone.
 * @param {DragEvent} event The drag start event.
 * @param {object} item The item being dragged (player or ball).
 * @param {string} type The type of the item ('player' or 'ball').
 */
const handleDragStart = (event, item, type) => {
  if (item.location === 'field') {
    event.preventDefault();
    return;
  }
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

/**
 * Handles the double click event for an item on the bench.
 * If the item is on the field, it will be returned to the bench.
 * @param {object} item The item that was double clicked.
 * @param {string} type The type of the item ('player' or 'ball').
 */
const handleDoubleClick = (item, type) => {
  if (item.location === 'field') {
    playStore.returnToBench(type, item.id);
  }
};

/**
 * Shows the confirmation dialog for resetting the board.
 */
const handleResetClick = () => {
  showConfirmReset.value = true;
};

/**
 * Handles the confirmation of resetting the board.
 * @param {boolean} confirmed - Whether the user confirmed the reset.
 */
const confirmReset = (confirmed) => {
  if (confirmed) {
    playStore.resetBoard();
  }
  showConfirmReset.value = false;
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
  transition: all 0.3s ease-in-out;
  border: 2px dashed transparent;
}

.team-colors-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-pickers {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker label {
  font-size: 12px;
  font-weight: 600;
}

.color-picker input[type="color"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.color-picker input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 50%;
}

.color-picker input[type="color"]::-webkit-color-swatch {
  border: 1px solid #000;
  border-radius: 50%;
}

.color-picker input[type="color"]::-moz-color-swatch {
  border: 1px solid #000;
  border-radius: 50%;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header input[type="color"] {
  width: 24px;
  height: 24px;
  border: 1px solid #ccc;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  padding: 0;
}

.section-header input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

.section-header input[type="color"]::-webkit-color-swatch {
  border: none;
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
  transition: all 0.2s ease-in-out;
}

.bench-item.is-ghost {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(80%);
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

.reset-section {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e0c9a6;
}

.reset-btn {
  width: 100%;
  padding: 8px;
  border: none;
  background-color: #f0e6d2;
  color: #7a4b00;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.reset-confirm {
  text-align: center;
  font-size: 12px;

  p {
    margin: 0 0 8px;
  }
}

.confirm-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin: 0 4px;
}

.confirm-btn--yes {
  background-color: #d9534f;
  color: white;
}

.confirm-btn--no {
  background-color: #ccc;
}
</style>
