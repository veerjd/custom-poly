const { query } = require('../db');
const { getPlayerIds, getLastTeam } = require('../methods');

module.exports = {
  name: 'remove',
  description:
    'Remove a player from an open or ongoing game. Must specify a game ID and mention user to add.',
  aliases: ['removeplayer'],
  shortUsage(prefix) {
    return `\`${prefix}remove\``;
  },
  longUsage(prefix) {
    return `\`${prefix}remove\``;
  },
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const userId = args[2].substring(2, 20);
      const game = args[1];
      const gameInfo = (
        await query(
          'SELECT status, host, teams, players FROM games WHERE id = $1',
          [game]
        )
      ).rows[0];
      const players = await getPlayerIds(game);

      if (game && gameInfo) {
        if (message.author.id === gameInfo.host || mod) {
          if (players.includes(userId)) {
            if (gameInfo.status === 'open' || gameInfo.status === 'ongoing') {
              const teams = (
                await query(
                  'SELECT id, name, player_ids FROM teams WHERE game_id = $1',
                  [game]
                )
              ).rows;
              const lastTeam = getLastTeam(game);

              let playerTeam, playerIndex;
              for (let i = 0; i < teams.length; i++) {
                playerIndex = teams[i].player_ids.findIndex(
                  (id) => id === userId
                );
                if (playerIndex !== -1) {
                  playerTeam = i;
                  break;
                }
              }

              if (gameInfo.players > 1) {
                if (playerTeam === teams.length - 1) {
                  const newTeam = [];
                  teams[playerTeam].player_ids.forEach((player) => {
                    if (player !== userId) {
                      newTeam.push(player);
                    }
                  });
                  await query(
                    'UPDATE teams SET player_ids = $1 WHERE id = $2',
                    [newTeam, teams[playerTeam].id]
                  );
                  returnMsg = `Successfully removed you from game ${game}.`;
                } else {
                  const lastPlayer = lastTeam.player_ids.pop();
                  teams[playerTeam].player_ids[playerIndex] = lastPlayer;

                  await query(
                    'UPDATE teams SET player_ids = $1 WHERE id = $2',
                    [teams[playerTeam].player_ids, teams[playerTeam].id]
                  );
                  await query(
                    'UPDATE teams SET player_ids = $1 WHERE id = $2',
                    [lastTeam.player_ids, lastTeam.id]
                  );
                  returnMsg = `Successfully removed you from game ${game}. <@${lastPlayer}> has been moved to team ${teams[playerTeam].name}.`;
                }
              } else {
                const deleteTeams = (
                  await query(
                    'SELECT id FROM teams WHERE game_id = $1 AND player_ids = $2',
                    [game, [userId]]
                  )
                ).rows;
                if (deleteTeams.length === 1) {
                  await query('DELETE FROM teams WHERE id = $1', [
                    deleteTeams[0].id,
                  ]);
                  returnMsg = `Successfully removed you from game ${game}.`;
                } else {
                  returnMsg = `Failed to remove you from game ${game}. Try running the command again or ask <@776656382010458112> for assistance.`;
                }
              }

              const numberGames = (
                await query('SELECT games FROM users WHERE id = $1', [userId])
              ).rows[0].games;
              await query('UPDATE users SET games = $1 WHERE id = $2', [
                numberGames - 1,
                userId,
              ]);
            } else {
              returnMsg = `Game ${game} is either complete or it has been deleted.`;
            }
          } else {
            returnMsg = `That player is not in game ${game}.`;
          }
        } else {
          returnMsg = 'You do not have permission to run this command.'
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `!remove` command takes a game ID as an argument. Do `!help leave` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
