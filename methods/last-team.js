const { query } = require('../db');

module.exports = {
  getLastTeam: async (game) => {
    const teams = (await query('SELECT * FROM teams WHERE game_id = $1', [game]))
      .rows;
    const lastTeam = teams.reduce(
      (prevValue, curValue) => {
        if (!prevValue || !prevValue.id) return curValue;
        if (prevValue.id < curValue.id) return curValue;
        return prevValue;
      },
      { id: 0, game_id: 0, name: '', player_ids: [0] }
    );
    return lastTeam;
  },
  nextTeamId: async () =>
    (await query('SELECT id FROM teams', [])).rows.reduce(
      (prevValue, curValue) => {
        if (!prevValue || !prevValue.id) return curValue;
        if (prevValue.id < curValue.id) return curValue;
        return prevValue;
      },
      { id: 0 }
    ).id + 1,
};
