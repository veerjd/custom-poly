const { query } = require('../db');
const { getPlayerIds } = require('../methods/get-players');

module.exports = {
  name: 'win',
  description:
    'Record a winner or winners for an ongoing game. Must specify a game ID and mention the winning player(s) or specify the winning team(s).',
  aliases: ['w', 'winners', 'wingame'],
  shortUsage(prefix) {
    return `\`${prefix}w\``;
  },
  longUsage(prefix) {
    return `\`${prefix}win\``;
  },
  example: 'win 10 <@776656382010458112> <@217385992837922819>',
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const game = args[1];
      const gameInfo = (
        await query('SELECT status FROM games WHERE id = $1', [game])
      ).rows[0];
      const user = message.author.id;
      const players = await getPlayerIds(game);
      if (game) {
        if (gameInfo) {
          if (players.includes(user) || mod) {
            if (
              gameInfo.status === 'ongoing' ||
              (mod && gameInfo.status === 'complete')
            ) {
              if (args[2]) {
                let winners = [];
                if (args[2].charAt(0) === '<') {
                  for (let i = 2; i < args.length; i++) {
                    const playerId = args[i].substring(2, 20);
                    if (!players.includes(playerId)) {
                      returnMsg = `<@${playerId}> is not in game ${game}. Make sure you typed the game ID correctly.`;
                      winners = [];
                      break;
                    }
                    winners.push((await query('SELECT id FROM players WHERE user_id = $1', [playerId])).rows[0].id);
                  }
                } else {
                  const teams = (
                    await query('SELECT name FROM teams WHERE game_id = $1', [
                      game,
                    ])
                  ).rows;
                  for (let i = 2; i < args.length; i++) {
                    const teamName = args[i];
                    if (!teams.includes({ name: teamName })) {
                      returnMsg = `Team ${teamName} was not found in game ${game}. Make sure you typed the game ID correctly.`;
                      winners = [];
                      break;
                    }
                    const teamPlayers = (
                      await query(
                        'SELECT player_ids FROM teams WHERE name = $1 AND game_id = $2',
                        [teamName, game]
                      )
                    ).rows[0].player_ids;
                    teamPlayers.forEach((playerId) => winners.push(playerId));
                  }
                }

                if (winners) {
                  for (const winnerId of winners) {
                    const numberWins = (
                      await query('SELECT wins FROM players WHERE id = $1', [
                        winnerId,
                      ])
                    ).rows[0].wins;
                    await query('UPDATE players SET wins = $1 WHERE id = $2', [
                      numberWins + 1,
                      winnerId,
                    ]);
                  }

                  await query(
                    'UPDATE games SET status = "complete" WHERE id = $1',
                    [game]
                  );
                }
              } else {
                returnMsg = 'You must specify the winners of the game.';
              }
            } else {
              returnMsg = 'Winners cannot be reported for this game right now.';
            }
          } else {
            returnMsg = `You are not in game ${game}.`;
          }
        } else {
          returnMsg = `Game ${game} could not be found.`;
        }
      } else {
        returnMsg =
          'The `$win` command takes a game ID as an argument. Do `$help win` for more information.';
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
