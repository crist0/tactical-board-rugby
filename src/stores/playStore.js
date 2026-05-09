import { defineStore } from 'pinia';

/**
 * Creates an array of player objects for a team.
 * @param {string} team - The team identifier (e.g., 'A' or 'B').
 * @param {string} color - The hex color code for the team.
 * @returns {Array<object>} An array of player objects.
 */
const createTeamPlayers = (team, color) =>
  Array.from({ length: 15 }, (_, index) => {
    const number = index + 1;
    return {
      id: `${team}${number}`,
      number,
      team,
      color,
      location: 'bench',
      x: 0,
      y: 0,
    };
  });

const initialPlayers = [
  ...createTeamPlayers('A', '#0055ff'),
  ...createTeamPlayers('B', '#ff2222'),
];

export const usePlayStore = defineStore('play', {
  state: () => ({
    players: initialPlayers,
    ball: {
      id: 'ball',
      location: 'center',
      x: 50,
      y: 35,
      color: '#ffffff',
    },
  }),
  actions: {
    /**
     * Moves an item (player or ball) to a specific position on the field.
     * @param {string} itemType - The type of item to move ('player' or 'ball').
     * @param {string} id - The ID of the item to move.
     * @param {number} x - The new x-coordinate on the field.
     * @param {number} y - The new y-coordinate on the field.
     */
    moveItemToField(itemType, id, x, y) {
      if (itemType === 'player') {
        const player = this.players.find((entry) => entry.id === id);
        if (!player) {
          return;
        }
        player.location = 'field';
        player.x = x;
        player.y = y;
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.location = 'field';
        this.ball.x = x;
        this.ball.y = y;
      }
    },
    /**
     * Updates the position of an item on the field.
     * @param {string} itemType - The type of item to update ('player' or 'ball').
     * @param {string} id - The ID of the item to update.
     * @param {number} x - The new x-coordinate.
     * @param {number} y - The new y-coordinate.
     */
    updateItemPosition(itemType, id, x, y) {
      if (itemType === 'player') {
        const player = this.players.find((entry) => entry.id === id);
        if (!player) {
          return;
        }
        player.x = x;
        player.y = y;
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.x = x;
        this.ball.y = y;
      }
    },
    /**
     * Returns an item (player or ball) to the bench.
     * @param {string} itemType - The type of item to return ('player' or 'ball').
     * @param {string} id - The ID of the item to return.
     */
    returnToBench(itemType, id) {
      if (itemType === 'player') {
        const player = this.players.find((entry) => entry.id === id);
        if (!player) {
          return;
        }
        player.location = 'bench';
        player.x = 0;
        player.y = 0;
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.location = 'bench';
        this.ball.x = 0;
        this.ball.y = 0;
      }
    },
  },
});
