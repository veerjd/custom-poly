const { db } = require('../db');

module.exports = {
  getPlayerIds: async (gameId) => {
    const returned = await db.query(
      'SELECT player_ids FROM teams WHERE game_id = $1',
      [gameId]
    ).rows;
    const players = [];
    for (const row of returned) {
      for (const player of row) {
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
        await db.query('SELECT name FROM users WHERE id = $1', [id]).rows[0]
          .name
      );
    }
    return playerNames;
  },
};
