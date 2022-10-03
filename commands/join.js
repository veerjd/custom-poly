const { query } = require('../db');
const { startGame } = require('../methods/start-game');
const { getLastTeam, nextTeamId } = require('../methods/last-team');
const { getPlayerIds } = require('../methods/get-players');

module.exports = {
  name: 'join',
  description: 'Join an open game. Must specify a game ID.',
  aliases: ['j'],
  shortUsage(prefix) {
    return `\`${prefix}j\``;
  },
  longUsage(prefix) {
    return `\`${prefix}join\``;
  },
  example: 'join 10',
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
          'SELECT structure, status, host, teams, players FROM games WHERE id = $1',
          [game]
        )
      ).rows[0];

      const userId = message.author.id;
      let userName, playerId;
      try {
        const returned = (
          await query('SELECT id, name FROM players WHERE user_id = $1', [
            userId,
          ])
        ).rows[0];
        userName = returned.name;
        playerId = returned.id;
      } catch {
        return ['Please register with me first using `$register`.'];
      }

      if (game && gameInfo) {
        if (gameInfo.status === 'open') {
          if (
            gameInfo.structure.includes('(') &&
            !message.member.roles.cache.some(
              (role) => role.name === 'customizer'
            )
          ) {
            returnMsg =
              'You must be a customizer to join this game. Ask a mod for the role.';
          } else {
            const players = await getPlayerIds(game);
            if (!players.includes(playerId)) {
              let teams = (
                await query('SELECT * FROM teams WHERE game_id = $1', [game])
              ).rows;
              const newTeamId = await nextTeamId();

              if (teams) {
                if (gameInfo.teams === 1) {
                  gameInfo.teams = gameInfo.players;
                  gameInfo.players = 1;
                }

                let lastTeam = await getLastTeam(game);
                let filledSlots = lastTeam.player_ids.length;

                if (
                  filledSlots >= gameInfo.players &&
                  teams.length < gameInfo.teams
                ) {
                  if (gameInfo.players > 1) {
                    const lastTeamName = lastTeam.name;
                    const newTeamName = String.fromCharCode(
                      lastTeamName.charCodeAt(0) + 1
                    );
                    await query(
                      'INSERT INTO teams VALUES ($1, $2, $3, $4)',
                      [newTeamId, game, newTeamName, [playerId]]
                    );
                  } else {
                    await query(
                      'INSERT INTO teams VALUES ($1, $2, $3, $4)',
                      [newTeamId, game, userName, [playerId]]
                    );
                  }
                  lastTeam = (await query('SELECT * FROM teams WHERE id = $1', [newTeamId])).rows[0];
                  teams = (
                    await query('SELECT * FROM teams WHERE game_id = $1', [game])
                  ).rows;
                } else {
                  lastTeam.player_ids.push(playerId);
                  await query('UPDATE teams SET player_ids = $1 WHERE id = $2', [
                    lastTeam.player_ids,
                    lastTeam.id,
                  ]);
                }

                returnMsg = `Successfully joined you to game ${game}`;
                if (gameInfo.players > 1) {
                  returnMsg += ` on team ${lastTeam.name}.`;
                } else {
                  returnMsg += '.';
                }

                filledSlots = lastTeam.player_ids.length;
                returnMsg += `\nThe last team has ${filledSlots} people. There are ${teams.length} teams out of ${gameInfo.teams} and ${filledSlots} players on the last team out of ${gameInfo.players}.`;

                if (
                  teams.length === gameInfo.teams &&
                  gameInfo.players === filledSlots
                ) {
                  const gameHostId = (await query('SELECT user_id FROM players WHERE id = $1', [gameInfo.host])).rows[0].user_id;

                  startGame(game, gameInfo.structure, message.guild);
                  await query(
                    'UPDATE games SET status = "ongoing" WHERE id = $1',
                    [game]
                  );

                  returnMsg += `\nGame ${game} has filled. <@${gameHostId}> can now start the game. `;
                  returnMsg += `Do \`$game ${game}\` to see the game details or \`$name ${game}\` to name the game.`;
                }
              } else {
                returnMsg = `Joined you to game ${game}`;
                if (gameInfo.teams > 1) {
                  await query('INSERT INTO teams VALUES ($1, $2, `A`, $3)', [
                    newTeamId,
                    game,
                    [playerId],
                  ]);
                  returnMsg += ' on team A.';
                } else {
                  await query('INSERT INTO teams VALUES ($1, $2, $3, $4)', [
                    newTeamId,
                    game,
                    userName,
                    [playerId],
                  ]);
                  returnMsg += '.';
                }
              }

              const numberGames = (
                await query('SELECT games FROM players WHERE id = $1', [
                  playerId,
                ])
              ).rows[0].games;
              await query('UPDATE players SET games = $1 WHERE id = $2', [
                numberGames + 1,
                playerId,
              ]);
            } else {
              returnMsg = `You are already in game ${game}.`;
            }
          }
        } else {
          returnMsg = `Game ${game} is not open and cannot be joined.`;
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `$join` command takes a game ID as an argument. Type `$help` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
