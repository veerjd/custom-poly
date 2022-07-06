const { db } = require('../db');
module.exports = {
  getPlayerIds: async (gameId) => {
    const returned = await db.query(
      'SELECT player_id1, player_id2, player_id3, player_id4 FROM teams WHERE game_id = $1',
      [gameId]
    );
    const players = [];
    for (const row of returned.rows) {
      if (row.player_id1) {
        players.push(row.player_id1);
      }
      if (row.player_id2) {
        players.push(row.player_id2);
      }
      if (row.player_id3) {
        players.push(row.player_id3);
      }
      if (row.player_id4) {
        players.push(row.player_id4);
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
