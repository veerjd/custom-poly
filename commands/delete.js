const db = require('../db.js');
const getPlayerIds = require('../methods/get-players');

module.exports = {
  name: 'delete',
  description: 'Delete a game. Must specify the game ID to delete.',
  aliases: [],
  shortUsage(prefix) {
    return `\`${prefix}delete\``;
  },
  longUsage(prefix) {
    return `\`${prefix}delete\``;
  },
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ').shift();
    try {
      const game = args[0];
      const returned = await db.query(
        'SELECT structure, status FROM games WHERE id = $1',
        [game]
      );
      const gameInfo = returned.rows[0];
      if (game && gameInfo) {
        const players = await getPlayerIds(game);
        if (players.includes(message.author.id) || mod) {
          switch (gameInfo.status) {
          case 'open':
          case 'ongoing':
            await db.query(
              'UPDATE games SET status = \'deleted\' WHERE id = $1',
              [game]
            );
            returnMsg = `Game ${game} has been deleted. Notifying players.`;
            players.forEach((id) => {
              returnMsg += ` <@${id}>`;
            });
            return [].push(returnMsg);
          case 'completed':
            return [
              `Game ${game} has already finished. It cannot be deleted now.`,
            ];
          case 'deleted':
            return [`Game ${game} has already been deleted.`];
          default:
            return [`Game ${game} was unable to be deleted.`];
          }
        } else {
          return ['You cannot delete a game you are not in.'];
        }
      } else {
        if (game) {
          return [`Game ${game} could not be found.`];
        } else {
          return [
            'The `!delete` command takes a game ID as an argument. Type `!help` for more information.',
          ];
        }
      }
    } catch (error) {
      throw error;
    }
  },
};
