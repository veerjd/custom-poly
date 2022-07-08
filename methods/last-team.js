const { query } = require('../db');

module.exports = {
  getLastTeam: async (game) => {
    const teams = await query('SELECT * FROM teams WHERE game_id = $1', [game])
      .rows;
    const lastTeam = teams.reduce((prevValue, curValue) => {
      if (!prevValue || !prevValue.id) return curValue;
      if (prevValue.id < curValue.id) return curValue;
      return prevValue;
    });
    return lastTeam;
  },
};
