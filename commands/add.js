const db = require('../db');
const startGame = require('../methods/start-game.js');

module.exports = {
  name: 'add',
  description:
    'Add a user to an open game. Must specify a game ID and user to add.',
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
    const args = message.split(' ').shift();
    try {
      const game = args[0];
      const gameInfo = await db.query(
        'SELECT status, host, teams, players FROM games WHERE id = $1',
        [game]
      ).rows[0];

      const userId = args[1].substring(2, 20);
      const userName = await db.query('SELECT name FROM users WHERE id = $1', [
        userId,
      ]).rows[0].name;

      if (message.author.id === gameInfo.host || mod) {
        if (game && gameInfo) {
          if (gameInfo.status === 'open') {
            const teams = await db.query(
              'SELECT * FROM teams WHERE game_id = $1',
              [game]
            ).rows;

            if (teams) {
              if (gameInfo.teams === 1) {
                gameInfo.teams = gameInfo.players;
                gameInfo.players = 1;
              }

              let lastTeam = teams[teams.length - 1];
              let filledSlots = 0;
              if (lastTeam.player_id1) {
                if (!lastTeam.player_id2) {
                  filledSlots = 1;
                } else if (!lastTeam.player_id3) {
                  filledSlots = 2;
                } else if (!lastTeam.player_id4) {
                  filledSlots = 3;
                } else {
                  filledSlots = 4;
                }
              }

              if (
                filledSlots >= gameInfo.players &&
                teams.length < gameInfo.teams
              ) {
                if (gameInfo.players > 1) {
                  const lastTeamName = lastTeam.name;
                  const newTeamName = String.fromCharCode(
                    lastTeamName.charCodeAt(0) + 1
                  );
                  lastTeam = await db.query(
                    'INSERT INTO teams (game_id, name, player_id1) VALUES ($1, $2, $3)',
                    [game, newTeamName, userId]
                  );
                } else {
                  lastTeam = await db.query(
                    'INSERT INTO teams (game_id, name, player_id1) VALUES ($1, $2, $3)',
                    [game, userName, userId]
                  );
                }
              } else {
                switch (filledSlots) {
                case 0:
                  await db.query(
                    'UPDATE team SET player_id1 = $1 WHERE id = $2',
                    [userId, lastTeam.id]
                  );
                  break;
                case 1:
                  await db.query(
                    'UPDATE team SET player_id2 = $1 WHERE id = $2',
                    [userId, lastTeam.id]
                  );
                  break;
                case 2:
                  await db.query(
                    'UPDATE team SET player_id3 = $1 WHERE id = $2',
                    [userId, lastTeam.id]
                  );
                  break;
                case 3:
                  await db.query(
                    'UPDATE team SET player_id4 = $1 WHERE id = $2',
                    [userId, lastTeam.id]
                  );
                  break;
                default:
                  return [
                    '<:994382517715083345:> There was an issue adding the player to the game.',
                  ];
                }
              }

              returnMsg = `Successfully added ${userName} to game ${game}`;
              if (gameInfo.players > 1) {
                returnMsg += ` on team ${lastTeam.name}.`;
              } else {
                returnMsg += '.';
              }

              if (lastTeam.player_id1) {
                if (!lastTeam.player_id2) {
                  filledSlots = 1;
                } else if (!lastTeam.player_id3) {
                  filledSlots = 2;
                } else if (!lastTeam.player_id4) {
                  filledSlots = 3;
                } else {
                  filledSlots = 4;
                }
              }

              if (
                teams.length === gameInfo.teams &&
                gameInfo.players === filledSlots
              ) {
                const gameInfo2 = await db.query(
                  'SELECT structure, host FROM games WHERE id = $1',
                  [game]
                ).rows[0];

                startGame(game, gameInfo2.structure);
                await db.query(
                  'UPDATE games SET status = `ongoing` WHERE id = $1',
                  [game]
                );

                returnMsg += `\nGame ${game} has filled. <@${gameInfo2.host}> can now start the game. `;
                returnMsg += `Do \`!game ${game}\` to see the game details or \`!name ${game}\` to name the game.`;
              }
            } else {
              if (gameInfo.teams > 1) {
                await db.query(
                  'INSERT INTO teams (game_id, name, player_id1) VALUES ($1, `A`, $2)',
                  [game, userId]
                );
              } else {
                await db.query(
                  'INSERT INTO teams (game_id, name, player_id1) VALUES ($1, $2, $3)',
                  [game, userName, userId]
                );
              }
            }
          } else {
            returnMsg = `Game ${game} is not open and players cannot be added to it.`;
          }
        } else {
          if (game) {
            returnMsg = `Game ${game} could not be found.`;
          } else {
            returnMsg =
              'The `!add` command takes a game ID and a user as arguments. Type `!help` for more information.';
          }
        }
      } else {
        returnMsg = 'You do not have permission to run this command.';
      }
    } catch (error) {
      throw error;
    }

    const returnArray = [].push(returnMsg);
    return returnArray;
  },
};
