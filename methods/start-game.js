/* Set up game channels when a game is started. */
const { query } = require('../db');
const { Permissions } = require('discord.js');
const { getPlayerIds, getUserIds } = require('./get-players');
const { createChannel } = require('./create-channel');
const { sendDm } = require('../index');

module.exports = {
  startGame: async (game, structure, guild) => {
    const players = getPlayerIds(game);
    const userIds = getUserIds(game);
    const gameInfo = (await query('SELECT * FROM games WHERE id = $1', [game]))
      .rows[0];
    const teams = (
      await query('SELECT * FROM teams WHERE game_id = $1', [game])
    ).rows;
    const playerPerms = [];
    userIds.forEach((playerId) => {
      playerPerms.push({
        id: playerId,
        allow: [Permissions.FLAGS.VIEW_CHANNEL],
      });
    });
    playerPerms.push({
      id: guild.id,
      deny: [Permissions.FLAGS.VIEW_CHANNEL],
    });

    let gameChannel;
    if (!gameInfo.structure.includes('Traitor')) {
      gameChannel = createChannel(
        guild,
        `game-${game}-${structure}`,
        'Ongoing games',
        playerPerms
      );
      gameChannel.send(
        `This is the game channel for game ${game}. The game mode is ${structure}. Players: ` +
          userIds.forEach((playerId) => `<@${playerId}> `) +
          '\nDo `$game` to see a list of teams.'
      );
    }

    if (gameInfo.teams > 1) {
      for (const team of teams) {
        const teamMembers = team.player_ids;
        const teamPerms = [];
        teamMembers.forEach(async (playerId) => {
          const userId = (
            await query('SELECT user_id FROM players WHERE id = $1', [playerId])
          ).rows[0].user_id;
          teamPerms.push({
            id: userId,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          });
        });
        teamPerms.push({
          id: guild.id,
          deny: [Permissions.FLAGS.VIEW_CHANNEL],
        });
        const teamChannel = createChannel(
          guild,
          `game-${game}-side-${team.name}`,
          'Ongoing games',
          teamPerms
        );
        teamChannel.send(
          `This is the team channel for team ${team.name} in game ${game}. The game mode is ${structure}. Team members: ` +
            teamMembers.forEach(async (playerId) => {
              const userId = (
                await query('SELECT user_id FROM players WHERE id = $1', [
                  playerId,
                ])
              ).rows[0].user_id;
              return `<@${userId}> `;
            }) +
            '\nDo `$game` to see a full list of players and teams.'
        );

        if (gameInfo.structure.includes('Traitor')) {
          let traitorId;
          do {
            traitorId = players[Math.floor(Math.random() * players.length)];
          } while (teamMembers.includes(traitorId));
          const { traitorUserId, traitorName, traitorGameName } = (
            await query(
              'SELECT user_id, name, game_name FROM players WHERE id = $1',
              [traitorId]
            )
          ).rows[0];

          teamChannel.send(
            `The traitor on the other team is ${traitorName}, whose in-game name is ${traitorGameName}.`
          );
          sendDm(
            traitorUserId,
            `You are the traitor in game ${game} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        }
      }
    }

    if (gameInfo.structure.includes('Werewol')) {
      const numWolves = Math.round(userIds.length / 3);
      const nonWolves = userIds;
      const wolves = [];
      let wolfIndex = 0;
      while (wolves.length < numWolves) {
        wolfIndex = Math.floor(Math.random() * userIds.length);
        if (nonWolves[wolfIndex]) {
          wolves.push(nonWolves[wolfIndex]);
          nonWolves[wolfIndex] = null;
        }
      }

      const wolvesPerms = [];
      wolves.forEach((userId) => {
        wolvesPerms.push({
          id: userId,
          allow: [Permissions.FLAGS.VIEW_CHANNEL],
        });
      });
      wolvesPerms.push({
        id: guild.id,
        deny: [Permissions.FLAGS.VIEW_CHANNEL],
      });
      createChannel(
        guild,
        `game-${game}-ww-only`,
        'Ongoing games',
        wolvesPerms
      ).send(
        `This is the channel for the werewolves in game ${game}. Wolves: ` +
          wolves.forEach((userId) => `<@${userId}> `) +
          '\nDo `$game` to see a full list of players.'
      );
    } else if (gameInfo.structure.includes('Make-Believe')) {
      const teamA = [0, 0, 0];
      const teamB = [0, 0, 0];
      const noTeam = players;
      noTeam.shift();

      while (noTeam.length > 0) {
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
          query('SELECT name FROM players WHERE id = $1', [playerId]).rows[0]
            .name
        )
      );
      teamB.forEach((playerId) =>
        teamBNames.push(
          query('SELECT name FROM players WHERE id = $1', [playerId]).rows[0]
            .name
        )
      );

      const dmMessage =
        `The Make-Believe game ${game} on CustomPoly has the following players:\n**Team A:** ` +
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
        teamBNames[2];
      const teamAHead = (
        await query('SELECT user_id FROM players WHERE id = $1', [teamA[0]])
      ).rows[0].user_id;
      const teamBHead = (
        await query('SELECT user_id FROM players WHERE id = $1', [teamB[0]])
      ).rows[0].user_id;
      sendDm(teamAHead, dmMessage);
      sendDm(teamBHead, dmMessage);
      sendDm(userIds[0], dmMessage);
    } else if (gameInfo.structure.includes('Bang')) {
      const unassignedPlayers = players;
      let i = 0;
      const sayRole = (userId, role) => {
        if (role === 'outlaw') {
          sendDm(
            userId,
            `You are an outlaw in Bang! game ${game} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        } else {
          sendDm(
            userId,
            `You are a ${role} in Bang! game ${game} on CustomPoly. (This email was sent from a no-reply address.)`
          );
        }
      };

      while (unassignedPlayers.length > 0) {
        const playerIndex = Math.floor(
          Math.random() * unassignedPlayers.length
        );
        const { userId, playerName } = (
          await query('SELECT id, user_id, name FROM players WHERE id = $1', [
            unassignedPlayers[playerIndex],
          ])
        ).rows[0];

        switch (i) {
          case 0:
            sayRole(userId, 'sheriff');
            gameChannel.send(`The sheriff is ${playerName}.`);
            break;
          case 1:
            sayRole(userId, 'renegade');
            break;
          case 2:
          case 3:
          case 5:
          case 7:
          case 9:
            sayRole(userId, 'outlaw');
            break;
          case 4:
          case 6:
          case 8:
          case 10:
            sayRole(userId, 'deputy');
            break;
          default:
            i = players.length;
        }

        unassignedPlayers.splice(playerIndex, 1);
        i++;
      }
    } else if (gameInfo.structure.includes('Zombies')) {
      const zombie = players[Math.floor(Math.random() * players.length)];
      const { zombieName, zombieGameName } = (
        await query('SELECT name, game_name FROM players WHERE id = $1', [
          zombie,
        ])
      ).rows[0];
      gameChannel.send(
        `${zombieName} (${zombieGameName} in-game) is the zombie to begin this game. (There is no consequence to pick a different zombie if the other players agree.)`
      );
    } else if (gameInfo.structure.includes('Tower')) {
      const runner = players[Math.floor(Math.random() * players.length)];
      const { runnerName, runnerGameName } = (
        await query('SELECT name, game_name FROM players WHERE id = $1', [
          runner,
        ])
      ).rows[0];
      gameChannel.send(
        `${runnerName} (${runnerGameName} in-game) is the runner. (There is no consequence to switch the runner.)`
      );
    }
  },
};
