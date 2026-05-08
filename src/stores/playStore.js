import { defineStore } from 'pinia';

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
  },
});
