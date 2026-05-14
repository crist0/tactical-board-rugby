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

const initialPlayers = (teamAColor, teamBColor) => [
  ...createTeamPlayers('A', teamAColor),
  ...createTeamPlayers('B', teamBColor),
];

export const usePlayStore = defineStore('play', {
  state: () => ({
    /** @type {Array<import('@/types').Player>} */
    players: initialPlayers(
      localStorage.getItem('teamAColor') || '#0055ff',
      localStorage.getItem('teamBColor') || '#ff2222',
    ),
    ball: {
      id: 'ball',
      location: 'center',
      x: 50,
      y: 35,
      color: '#ffffff',
    },
    /** @type {string} */
    teamAColor: localStorage.getItem('teamAColor') || '#0055ff',
    /** @type {string} */
    teamBColor: localStorage.getItem('teamBColor') || '#ff2222',
  }),
  actions: {
    /**
     * Updates the color for a specified team and saves it to local storage.
     * @param {'A' | 'B'} team - The team to update ('A' or 'B').
     * @param {string} color - The new hex color code.
     */
    updateTeamColor(team, color) {
      if (team === 'A') {
        this.teamAColor = color;
        localStorage.setItem('teamAColor', color);
        this.players
          .filter((p) => p.team === 'A')
          .forEach((p) => {
            p.color = color;
          });
      } else if (team === 'B') {
        this.teamBColor = color;
        localStorage.setItem('teamBColor', color);
        this.players
          .filter((p) => p.team === 'B')
          .forEach((p) => {
            p.color = color;
          });
      }
    },
    /**
     * Moves an item (player or ball) to a specific position on the field.
     * If the item is a player, it first checks if another player with the same
     * team and number is already on the field to prevent duplicates.
     * @param {string} itemType - The type of item to move ('player' or 'ball').
     * @param {string} id - The ID of the item to move.
     * @param {number} x - The new x-coordinate on the field.
     * @param {number} y - The new y-coordinate on the field.
     */
    moveItemToField(itemType, id, x, y) {
      if (itemType === 'player') {
        const playerToMove = this.players.find((p) => p.id === id);
        if (!playerToMove) {
          return;
        }

        // Logical Guard: Check for duplicates before moving
        const isDuplicate = this.players.some(
          (p) =>
            p.team === playerToMove.team &&
            p.number === playerToMove.number &&
            p.location === 'field',
        );

        if (isDuplicate) {
          return; // Abort if a duplicate is already on the field
        }

        playerToMove.location = 'field';
        playerToMove.x = x;
        playerToMove.y = y;
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.location = 'field';
        this.ball.x = x;
        this.ball.y = y;
      }
    },
    /**
     * Updates the position of an item that is already on the field.
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
     * Returns an item (player or ball) from the field to the bench.
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

    /**
     * Resets the entire board by returning all players and the ball to the bench.
     */
    resetBoard() {
      this.players.forEach((player) => {
        player.location = 'bench';
        player.x = 0;
        player.y = 0;
      });

      this.ball.location = 'bench';
      this.ball.x = 0;
      this.ball.y = 0;
    },
  },
});
