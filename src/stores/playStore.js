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
});
