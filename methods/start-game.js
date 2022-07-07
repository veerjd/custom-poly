/* Set up game channels when a game is started. */
const { query } = require('../db');
const { guild, Permissions } = require('discord.js');
const getPlayerIds = require('./get-players');
const createChannel = require('./create-channel');
const { sendDm } = require('../index');

module.exports = {
  startGame: async (id, structure, guildId) => {
    const players = getPlayerIds(id);
    const gameInfo = await query('SELECT * FROM games WHERE id = $1', [id]);
    const teams = await query('SELECT * FROM teams WHERE game_id = $1', [id])
      .rows;
    const playerPerms = [];
    players
      .forEach((playerId) => {
        playerPerms.push({
          id: playerId,
          allow: [Permissions.FLAGS.VIEW_CHANNEL],
        });
      })
      .push({
        id: guildId,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      });

    let gameChannel;
    if (!gameInfo.structure.includes('Traitor')) {
      gameChannel = createChannel(
        `game-${id}-${structure}`,
        'Ongoing Games',
        playerPerms
      );
      gameChannel.send(
        `This is the game channel for game ${id}. The game mode is ${structure}. Players: ` +
          players.forEach((playerId) => `<@${playerId}> `) +
          '\nDo `!game` to see a list of teams.'
      );
    }

    if (gameInfo.teams > 1) {
      for (const team of teams) {
        const teamMembers = team.player_ids;
        const teamPerms = [];
        teamMembers
          .forEach((playerId) => {
            teamPerms.push({
              id: playerId,
              allow: [Permissions.FLAGS.VIEW_CHANNEL],
            });
          })
          .push({
            id: guildId,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
          });
        const teamChannel = createChannel(
          `game-${id}-side-${team.name}`,
          'Ongoing Games',
          teamPerms
        );
        teamChannel.send(
          `This is the team channel for team ${team.name} in game ${id}. The game mode is ${structure}. Team members: ` +
            teamMembers.forEach((playerId) => `<@${playerId}> `) +
            '\nDo `!game` to see a full list of players and teams.'
        );

        if (gameInfo.structure.includes('Traitor')) {
          let traitorId;
          do {
            traitorId = players[Math.floor(Math.random() * players.length)];
          } while (!teamMembers.includes(traitorId));
          const { traitorName, traitorGameName } = await query(
            'SELECT name, game_name FROM users WHERE id = $1',
            [traitorId]
          );

          teamChannel.send(
            `The traitor on the other team is ${traitorName}, whose in-game name is ${traitorGameName}.`
          );
          sendDm(
            traitorId,
            `You are the traitor in game ${id} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        }
      }
    }

    if (gameInfo.structure.includes('Werewol')) {
      const numWolves = Math.round(players.length / 3);
      const nonWolves = players;
      const wolves = [];
      let wolfIndex = 0;
      while (wolves.length < numWolves) {
        wolfIndex = Math.floor(Math.random() * players.length);
        if (nonWolves[wolfIndex]) {
          wolves.push(nonWolves[wolfIndex]);
          nonWolves[wolfIndex] = null;
        }
      }

      const wolvesPerms = [];
      wolves
        .forEach((playerId) => {
          wolvesPerms.push({
            id: playerId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          });
        })
        .push({
          id: guildId,
          deny: [Permissions.FLAGS.VIEW_CHANNEL],
        });
      createChannel(`game-${id}-ww-only`, 'Ongoing Games', wolvesPerms).send(
        `This is the channel for the werewolves in game ${id}. Wolves: ` +
          wolves.forEach((playerId) => `<@${playerId}> `) +
          '\nDo `!game` to see a full list of players.'
      );
    } else if (gameInfo.structure.includes('Make-Believe')) {
      const teamA = [0, 0, 0];
      const teamB = [0, 0, 0];
      const noTeam = players;
      noTeam.pop();

      while (noTeam !== []) {
        const player = noTeam[0];
        let playerIndex = Math.floor(Math.random() * 6);
        let playerArray = 0;
        if (playerIndex > 2) {
          playerArray = 1;
          playerIndex -= 3;
        }
        if (playerArray) {
          if (!teamB[playerIndex]) {
            teamB[playerIndex] = noTeam.shift();
          }
        } else {
          if (!teamA[playerIndex]) {
            teamA[playerIndex] = noTeam.shift();
          }
        }
      }

      let teamANames, teamBNames;
      teamA.forEach((playerId) =>
        teamANames.push(
          query('SELECT name FROM users WHERE id = $1', [playerId])
        )
      );
      teamB.forEach((playerId) =>
        teamBNames.push(
          query('SELECT name FROM users WHERE id = $1', [playerId])
        )
      );

      sendDm(
        teamA[0],
        `You are a team captain in Make-Believe game ${id} on CustomPoly. (This email was sent from a no-reply address.)`
      );
      sendDm(
        teamB[0],
        `You are a team captain in Make-Believe game ${id} on CustomPoly. (This email was sent from a no-reply address.)`
      );
      sendDm(
        players[6],
        `The Make-Believe game ${id} on CustomPoly has the following players:\n**Team A:** ` +
          teamANames[0] +
          ', ' +
          teamANames[1] +
          ', ' +
          teamANames[2] +
          '\n**Team B:** ' +
          teamBNames[0] +
          ', ' +
          teamBNames[1] +
          ', ' +
          teamBNames[2]
      );
    } else if (gameInfo.structure.includes('Bang')) {
      const unassignedPlayers = players;
      let i = 0;
      const sayRole = (playerId, role) => {
        if (role === 'outlaw') {
          sendDm(
            playerId,
            `You are an outlaw in Bang! game ${id} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        } else {
          sendDm(
            playerId,
            `You are a ${role} in Bang! game ${id} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        }
      };

      while (i < players.length) {
        const playerId =
          unassignedPlayers[Math.floor(Math.random() * players.length)];
        let playerName;
        if (playerId) {
          if (i === 0) {
            playerName = await query('SELECT name FROM users WHERE id = $1', [
              playerId,
            ]).rows[0].name;
          }
          switch (i) {
            case 0:
              sayRole(playerId, 'sheriff');
              gameChannel.send(`The sheriff is ${playerName}.`);
              break;
            case 1:
              sayRole(playerId, 'renegade');
              break;
            case 2:
            case 3:
            case 5:
            case 7:
            case 9:
              sayRole(playerId, 'outlaw');
              break;
            case 4:
            case 6:
            case 8:
            case 10:
              sayRole(playerId, 'deputy');
              break;
            default:
              i = players.length;
          }
          i++;
        }
      }
    } else if (gameInfo.structure.includes('Zombies')) {
      const zombie = players[Math.floor(Math.random() * players.length)];
      const { zombieName, zombieGameName } = await query(
        'SELECT name, game_name FROM users WHERE id = $1',
        [zombie]
      );
      gameChannel.send(
        `${zombieName} (${zombieGameName} in-game) is the zombie to begin this game. (There is no consequence to pick a different zombie if the other players agree.)`
      );
    } else if (gameInfo.structure.includes('Tower')) {
      const runner = players[Math.floor(Math.random() * players.length)];
      const { runnerName, runnerGameName } = await query(
        'SELECT name, game_name FROM users WHERE id = $1',
        [runner]
      );
      gameChannel.send(
        `${runnerName} (${runnerGameName} in-game) is the runner. (There is no consequence to switch the runner.)`
      );
    }
  },
};