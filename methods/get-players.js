/* eslint-disable no-console */
const { query } = require('../db');

module.exports = {
  getPlayerIds: async (gameId) => {
    const returned = await query(
      'SELECT player_ids FROM teams WHERE game_id = $1',
      [gameId]
    );
    const players = [];
    for (const row of returned.rows) {
      for (const player of row.player_ids) {
        players.push(player);
      }
    }
    return players;
  },
  getUserIds: async (playerIds) => {
    const userIds = [];
    for (const id of playerIds) {
      userIds.push(
        await query('SELECT user_id FROM players WHERE id = $1', [id]).rows[0]
          .user_id
      );
    }
    return userIds;
  }
};
