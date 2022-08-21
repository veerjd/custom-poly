const { query } = require('../db');

module.exports = {
  name: 'games',
  description: 'See games that are open or ongoing.',
  aliases: ['gs', 'opengames'],
  shortUsage(prefix) {
    return `\`${prefix}gs\``;
  },
  longUsage(prefix) {
    return `\`${prefix}games\``;
  },
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      if (['ongoing', 'running', 'inprogress'].includes(args[1])) {
        const games = (
          await query(
            'SELECT id, structure, name, host FROM games WHERE status = "ongoing"',
            []
          )
        ).rows;

        if (games.length === 0) {
          returnMsg = 'There are currently no ongoing games.';
        } else {
          returnMsg = '**__Ongoing Games__**';
          for (const game of games) {
            returnMsg += `\n__Game ${game.id}`;
            if (game.name !== 'unnamed') {
              returnMsg += `, *${game.name}`;
            }
            returnMsg += `:__ ${game.structure} hosted by <@${game.host}>`;
          }
          returnMsg += '\n\n*Ongoing games cannot be joined.*';
        }
      } else {
        const games = (
          await query(
            'SELECT id, structure, host FROM games WHERE status = "open"',
            []
          )
        ).rows;

        if (games.length === 0) {
          returnMsg = 'There are currently no open games.';
        } else {
          returnMsg = '**__Open Games__**';
          for (const game of games) {
            returnMsg += `\n__Game ${game.id}:__ ${game.structure} hosted by <@${game.host}>`;
          }
          returnMsg +=
            '\n\n*You can join one of these games with the `!join` command.*';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
