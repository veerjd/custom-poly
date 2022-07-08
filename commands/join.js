const db = require('../db');
const { startGame, getLastTeam } = require('../methods');

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
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ');
    try {
      const game = args[1];
      const gameInfo = (await db.query(
        'SELECT status, teams, players FROM games WHERE id = $1',
        [game]
      )).rows[0];

      const userId = message.author.id;
      let userName;
      try {
        userName = (await db.query('SELECT name FROM users WHERE id = $1', [
          userId,
        ])).rows[0].name;
      } catch {
        return ['Please register with me first using `!register`.'];
      }

      if (game && gameInfo) {
        if (gameInfo.status === 'open') {
          const teams = (await db.query(
            'SELECT * FROM teams WHERE game_id = $1',
            [game]
          )).rows;

          if (teams) {
            if (gameInfo.teams === 1) {
              gameInfo.teams = gameInfo.players;
              gameInfo.players = 1;
            }

            let lastTeam = getLastTeam(game);
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
                lastTeam = await db.query(
                  'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, $2, $3)',
                  [game, newTeamName, [userId]]
                );
              } else {
                lastTeam = await db.query(
                  'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, $2, $3)',
                  [game, userName, [userId]]
                );
              }
            } else {
              lastTeam.player_ids.push(userId);
              await db.query('UPDATE team SET player_ids = $1 WHERE id = $2', [
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

            if (
              teams.length === gameInfo.teams &&
              gameInfo.players === filledSlots
            ) {
              const gameInfo2 = (await db.query(
                'SELECT structure, host FROM games WHERE id = $1',
                [game]
              )).rows[0];

              startGame(game, gameInfo2.structure, message.guild.id);
              await db.query(
                'UPDATE games SET status = `ongoing` WHERE id = $1',
                [game]
              );

              returnMsg += `\nGame ${game} has filled. <@${gameInfo2.host}> can now start the game. `;
              returnMsg += `Do \`!game ${game}\` to see the game details or \`!name ${game}\` to name the game.`;
            }
          } else {
            returnMsg = `Joined you to game ${game}`
            if (gameInfo.teams > 1) {
              await db.query(
                'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, `A`, $2)',
                [game, [userId]]
              );
              returnMsg += ' on team A.';
            } else {
              await db.query(
                'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, $2, $3)',
                [game, userName, [userId]]
              );
              returnMsg += '.';
            }
          }

          const numberGames = (await db.query(
            'SELECT games FROM users WHERE id = $1',
            [userId]
          )).rows[0].games;
          await db.query('UPDATE users SET games = $1 WHERE id = $2', [
            numberGames + 1,
            userId,
          ]);
        } else {
          returnMsg = `Game ${game} is not open and cannot be joined.`;
        }
      } else {
        if (game) {
          returnMsg = `Game ${game} could not be found.`;
        } else {
          returnMsg =
            'The `!join` command takes a game ID as an argument. Type `!help` for more information.';
        }
      }
    } catch (error) {
      throw error;
    }

    const returnArray = [].push(returnMsg);
    return returnArray;
  },
};
