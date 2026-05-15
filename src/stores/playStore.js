import { defineStore } from 'pinia';
import { useUiStore } from '@/stores/uiStore';

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
      isDragging: false,
      lastMovedTimestamp: 0,
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
      isDragging: false,
      linkedTo: null,
      lastMovedTimestamp: 0,
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
        playerToMove.lastMovedTimestamp = Date.now();
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.location = 'field';
        this.ball.x = x;
        this.ball.y = y;
        this.ball.lastMovedTimestamp = Date.now();
      }
    },
    /**
     * Sets the dragging state for a player or ball.
     * @param {'player' | 'ball'} itemType - The type of item.
     * @param {string} id - The ID of the item.
     * @param {boolean} status - Whether the item is being dragged.
     */
    setDragging(itemType, id, status) {
      if (itemType === 'player') {
        const player = this.players.find((entry) => entry.id === id);
        if (player) {
          player.isDragging = status;
        }
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.isDragging = status;
      }
    },
    /**
     * Links ball to player and forces immediate coordinate synchronization.
     * The ball will follow the player's position when it is updated. Pass null to unlink.
     * @param {string|null} playerId - The player ID to link the ball to, or null to unlink.
     */
    linkBallToPlayer(playerId) {
      this.ball.linkedTo = playerId;

      if (playerId) {
        const player = this.players.find((p) => p.id === playerId);
        if (player) {
          const uiStore = useUiStore();
          const elementSizeUnits = uiStore.playerSize * 10;
          this.ball.x = player.x + elementSizeUnits * 1.2;
          this.ball.y = player.y;
        }
      }
    },
    /**
     * Updates the position of an item that is already on the field.
     * If the ball is linked to a player and that player is being updated,
     * the ball automatically moves offset to the right of the player.
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
        player.lastMovedTimestamp = Date.now();

        // If the ball is linked to this player, move it offset to the right
        if (this.ball.linkedTo === player.id && this.ball.location === 'field') {
          this.ball.x = player.x + 15;
          this.ball.y = player.y;
          this.ball.lastMovedTimestamp = Date.now();
        }
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.lastMovedTimestamp = Date.now();
        // If the ball is linked to a player, compute position relative to that player
        if (this.ball.linkedTo) {
          const linkedPlayer = this.players.find((p) => p.id === this.ball.linkedTo);
          if (linkedPlayer) {
            this.ball.x = linkedPlayer.x + 15;
            this.ball.y = linkedPlayer.y;
            return;
          }
        }
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

        // If the ball was linked to this player, unlink it
        if (this.ball.linkedTo === player.id) {
          this.ball.linkedTo = null;
        }
        return;
      }

      if (itemType === 'ball' && this.ball.id === id) {
        this.ball.location = 'bench';
        this.ball.x = 0;
        this.ball.y = 0;
        this.ball.linkedTo = null; // Clear link when ball returns to bench
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
        player.lastMovedTimestamp = 0;
      });

      this.ball.location = 'bench';
      this.ball.x = 0;
      this.ball.y = 0;
      this.ball.linkedTo = null;
      this.ball.lastMovedTimestamp = 0;
    },
  },
});