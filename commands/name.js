const { query } = require('../db');
const { getPlayerIds } = require('../methods/get-players.js');

module.exports = {
  name: 'name',
  description:
    'Set or change the name of a game. Must specify the game ID and the (new) name.',
  aliases: ['n', 'gamename'],
  shortUsage(prefix) {
    return `\`${prefix}n\``;
  },
  longUsage(prefix) {
    return `\`${prefix}name\``;
  },
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const userId = message.author.id;
      const game = args[1];
      const gameInfo = (
        await query('SELECT status, name FROM games WHERE id = $1', [game])
      ).rows[0];
      const players = await getPlayerIds(game);

      const gameName = args.slice(2, args.length).join(' ');

      if (game && gameInfo) {
        if (players.includes(userId) || mod) {
          if (gameInfo.status === 'open' || gameInfo.status === 'ongoing') {
            await query('UPDATE games SET name = $1 WHERE id = $2', [
              gameName,
              game,
            ]);
            if (gameInfo.name === 'unnamed') {
              returnMsg = `Game ${game} has been named ${gameName}.`;
            } else {
              returnMsg = `Game ${game} has been renamed to ${gameName}.`;
            }
          } else {
            const returnStatement =
              gameInfo.status === 'completed'
                ? 'already finished'
                : 'been deleted';
            returnMsg = `Game ${game} has ${returnStatement}, it cannot be renamed.`;
          }
        } else {
          returnMsg = `You are not in game ${game}.`;
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `!name` command takes a game ID as an argument. Do `!help name` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
