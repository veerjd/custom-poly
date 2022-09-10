const { query } = require('../db');
const { startGame } = require('../methods/start-game');
const { nextTeamId, getLastTeam } = require('../methods/last-team');
const { getPlayerIds } = require('../methods/get-players');

module.exports = {
  name: 'add',
  description:
    'Add a user to an open or ongoing game. Must specify a game ID and mention user to add.',
  aliases: ['addplayer'],
  shortUsage(prefix) {
    return `\`${prefix}add\``;
  },
  longUsage(prefix) {
    return `\`${prefix}addplayer\``;
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
          'SELECT status, host, teams, players FROM games WHERE id = $1',
          [game]
        )
      ).rows[0];

      const userId = args[2].substring(2, 20);
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
        return [
          'That user was not found in my database. Make sure you ping the user.',
        ];
      }

      if (game && gameInfo) {
        if (message.author.id === gameInfo.host || mod) {
          if (gameInfo.status === 'open' || gameInfo.status === 'ongoing') {
            const players = await getPlayerIds(game);
            if (!players.includes(playerId)) {
              const teams = (
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
                    await query('INSERT INTO teams VALUES ($1, $2, $3, $4)', [
                      newTeamId,
                      game,
                      newTeamName,
                      [playerId],
                    ]);
                  } else {
                    await query('INSERT INTO teams VALUES ($1, $2, $3, $4)', [
                      newTeamId,
                      game,
                      userName,
                      [playerId],
                    ]);
                  }
                  lastTeam = (
                    await query('SELECT * FROM teams WHERE id = $1', [
                      newTeamId,
                    ])
                  ).rows[0];
                } else {
                  lastTeam.player_ids.push(playerId);
                  await query('UPDATE team SET player_ids = $1 WHERE id = $2', [
                    lastTeam.player_ids,
                    lastTeam.id,
                  ]);
                }

                returnMsg = `Successfully added ${userName} to game ${game}`;
                if (gameInfo.players > 1) {
                  returnMsg += ` on team ${lastTeam.name}.`;
                } else {
                  returnMsg += '.';
                }

                filledSlots = lastTeam.player_ids.length;

                if (
                  teams.length === gameInfo.teams &&
                  gameInfo.players === filledSlots
                ) {
                  const gameInfo2 = (
                    await query(
                      'SELECT structure, host FROM games WHERE id = $1',
                      [game]
                    )
                  ).rows[0];

                  startGame(game, gameInfo2.structure, message.guild);
                  await query(
                    'UPDATE games SET status = `ongoing` WHERE id = $1',
                    [game]
                  );

                  returnMsg += `\nGame ${game} has filled. <@${gameInfo2.host}> can now start the game. `;
                  returnMsg += `Do \`$game ${game}\` to see the game details or \`$name ${game}\` to name the game.`;
                }
              } else {
                if (gameInfo.teams > 1) {
                  await query('INSERT INTO teams VALUES ($1, $2, `A`, $3)', [
                    newTeamId,
                    game,
                    [playerId],
                  ]);
                } else {
                  await query('INSERT INTO teams VALUES ($1, $2, $3, $4)', [
                    newTeamId,
                    game,
                    userName,
                    [playerId],
                  ]);
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
              returnMsg = `That player is already in game ${game}.`;
            }
          } else {
            returnMsg = `Game ${game} is not open and players cannot be added to it.`;
          }
        } else {
          returnMsg = 'You do not have permission to run this command.';
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `$add` command takes a game ID and a user as arguments. Type `$help` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
