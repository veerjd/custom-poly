const { query } = require('../db');
const { getPlayerIds } = require('../methods/get-players');
const { getLastTeam } = require('../methods/last-team');

module.exports = {
  name: 'leave',
  description: 'Leave an open game. Must specify a game ID.',
  aliases: ['l', 'leavegame'],
  shortUsage(prefix) {
    return `\`${prefix}l\``;
  },
  longUsage(prefix) {
    return `\`${prefix}leave\``;
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
        await query('SELECT status, teams, players FROM games WHERE id = $1', [
          game,
        ])
      ).rows[0];
      const players = await getPlayerIds(game);
      const checkPlayer = (
        await query('SELECT id FROM players WHERE user_id = $1', [userId])
      ).rows;

      if (game && gameInfo) {
        if (checkPlayer.length > 0) {
          const playerId = checkPlayer[0].id;
          if (players.includes(playerId)) {
            if (gameInfo.status === 'open') {
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
                  (id) => id === playerId
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
                    if (player !== playerId) {
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
                    [game, [playerId]]
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
                await query('SELECT games FROM players WHERE id = $1', [
                  playerId,
                ])
              ).rows[0].games;
              await query('UPDATE players SET games = $1 WHERE id = $2', [
                numberGames - 1,
                playerId,
              ]);
            } else {
              returnMsg = `Game ${game} is no longer open. Ask the game host or a helper to remove you.`;
            }
          } else {
            returnMsg = `You are not in game ${game}.`;
          }
        } else {
          returnMsg =
            'You are not registered with me. Do `!help register` for more information.';
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `!leave` command takes a game ID as an argument. Do `!help leave` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
