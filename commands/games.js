const db = require('../db');

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
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ').shift();
    try {
      if (['ongoing', 'running', 'inprogress'].includes(args[0])) {
        const games = await db.query(
          'SELECT id, structure, name, host FROM games WHERE status = `ongoing`',
          []
        ).rows;

        returnMsg = '**__Ongoing Games__**';
        for (const game of games) {
          returnMsg += `\n__Game ${game.id}`;
          if (game.name !== 'unnamed') {
            returnMsg += `, *${game.name}`;
          }
          returnMsg += `:__ ${game.structure} hosted by <@${game.host}>`;
        }
        returnMsg += '\n\n*Ongoing games cannot be joined.*';
      } else {
        const games = await db.query(
          'SELECT id, structure, host FROM games WHERE status = `open`',
          []
        ).rows;

        returnMsg = '**__Open Games__**';
        for (const game of games) {
          returnMsg += `\n__Game ${game.id}:__ ${game.structure} hosted by <@${game.host}>`;
        }
        returnMsg += '\n\n*Ongoing games cannot be joined.*';
      }
    } catch (error) {
      throw error;
    }

    const returnArray = [].push(returnMsg);
    return returnArray;
  },
};
