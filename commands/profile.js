const { query } = require('../db');

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
      const user = (
        await query('SELECT * FROM users WHERE id = $1', [userId])
      ).rows[0];

      returnMsg += `**${user.name}'s Profile**\n__In-game name:__ ${user.game_name}\n__Games played:__ ${user.games}\n__Wins:__ ${user.wins}\n\n*Games ${user.name} is currently in:*`;

      const allGames = (
        await query(
          'SELECT games.id, games.structure, games.status, games.name AS game_name, games.teams AS number_teams, teams.name AS team_name, teams.player_ids FROM games JOIN teams ON teams.game_id = game.id',
          []
        )
      ).rows;
      for (const game of allGames) {
        if (
          game.player_ids.includes(userId) &&
          (game.status === 'open' || game.status === 'ongoing')
        ) {
          returnMsg += `\n${game.structure} game ${game.id} `;
          if (game.game_name !== 'unnamed') {
            returnMsg += `*${game.game_name} `;
          }
          if (game.number_teams > 1) {
            returnMsg += `on team ${game.team_name}`;
          }
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
