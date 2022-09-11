const { query } = require('../db');
const { getPlayerIds } = require('../methods/get-players');

module.exports = {
  name: 'profile',
  description: 'View a user\'s profile. May mention a user.',
  aliases: ['p', 'player', 'user'],
  shortUsage(prefix) {
    return `\`${prefix}p\``;
  },
  longUsage(prefix) {
    return `\`${prefix}profile\``;
  },
  example: 'profile <@776656382010458112>',
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      let userId;
      if (args.length === 1) {
        userId = message.author.id;
      } else {
        userId = args[1].substring(2, 20);
      }
      const userEntries = (
        await query('SELECT * FROM players WHERE user_id = $1', [userId])
      ).rows;

      if (userEntries.length > 0) {
        const user = userEntries[0];
        returnMsg += `**${user.name}'s Profile**\n__In-game name:__ ${user.game_name}\n__Games played:__ ${user.games}\n__Wins:__ ${user.wins}`;

        const allGames = (await query('SELECT * FROM games', [])).rows;
        const userGames = [];
        for (const game of allGames) {
          const gamePlayers = await getPlayerIds(game.id);
          if (
            gamePlayers.includes(user.id) &&
            (game.status === 'open' || game.status === 'ongoing')
          ) {
            userGames.push(game);
          }
        }
        if (userGames.length > 0) {
          returnMsg += `\n\n*Games ${user.name} is currently in:*`;
          for (const game of userGames) {
            returnMsg += `\n${game.structure} game ${game.id} `;
            if (game.name !== 'unnamed') {
              returnMsg += `*${game.name} `;
            }
            if (game.teams > 1) {
              returnMsg += `on team ${game.team_name}`;
            }
          }
        }
      } else {
        if (userId === message.author.id) {
          returnMsg =
            'You must be registered with me to view your profile. Do `$help register` for more information.';
        } else {
          returnMsg = 'That user is not registered with me.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
