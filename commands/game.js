const { query } = require('../db.js');
const getPlayerIds = require('../methods/get-players');

module.exports = {
  name: 'game',
  description: 'View the details of a game. Must specify a game ID.',
  aliases: ['g', 'gameinfo'],
  shortUsage(prefix) {
    return `\`${prefix}g\``;
  },
  longUsage(prefix) {
    return `\`${prefix}game\``;
  },
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const game = args[1];
      const gameInfo = (
        await query(
          'SELECT structure, status, name, host FROM games WHERE id = $1',
          [game]
        )
      ).rows[0];
      if (game && gameInfo) {
        if (gameInfo.status !== 'deleted') {
          const players = await getPlayerIds(game);
          const teams = (
            await query(
              'SELECT name, player_ids FROM teams WHERE game_id = $1',
              [game]
            )
          ).rows;

          returnMsg += `**__Game ${game}`;
          if (gameInfo.name !== 'unnamed') {
            returnMsg.push(`: ${gameInfo.name}`);
          }
          returnMsg += `__**\nGame mode: ${gameInfo.structure} \nThis game `;
          if (
            gameInfo.status === 'completed' ||
            gameInfo.status === 'deleted'
          ) {
            returnMsg.push(
              `was ${gameInfo.status}, and it was hosted by <@${gameInfo.host}>.`
            );
          } else {
            returnMsg.push(
              `is ${gameInfo.status} and hosted by <@${gameInfo.host}>.`
            );
          }

          if (teams.length === players.length) {
            returnMsg += '\n';
            for (const playerId of players) {
              const playerInfo = (
                await query(
                  'SELECT name, game_name FROM players WHERE id = $1',
                  [playerId]
                )
              ).rows[0];
              returnMsg += `\n**${playerInfo.name}** - *${playerInfo.gameName}*`;
            }
          } else {
            let playerIds = [];
            for (const team of teams) {
              returnMsg += `\n\n**Team ${team.name}**`;
              playerIds = team.player_ids;
              while (playerIds.length > 0) {
                const player = (
                  await query(
                    'SELECT name, game_name FROM players WHERE id = $1',
                    [playerIds[0]]
                  )
                ).rows[0];
                returnMsg.push(`\n\t${player.name} - *${player.game_name}*`);
                playerIds.shift();
              }
            }
          }
        } else {
          returnMsg = `Game ${game} has been deleted.`;
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `!game` command takes a game ID as an argument. Type `!help` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
