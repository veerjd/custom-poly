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
  getPlayers: async (gameId) => {
    const playerIds = await this.getPlayerIds(gameId);
    const playerNames = [];
    for (const id of playerIds) {
      playerNames.push(
        await query('SELECT name FROM players WHERE id = $1', [id]).rows[0]
          .name
      );
    }
    return playerNames;
  },
  getUserIds: async (gameId) => {
    const playerIds = await this.getPlayerIds(gameId);
    const userIds = [];
    for (const id of playerIds) {
      userIds.push(
        await query('SELECT user_id FROM players WHERE id = $1', [id]).rows[0]
          .name
      );
    }
    return userIds;
  }
};
