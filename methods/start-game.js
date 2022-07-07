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

    if (gameInfo.structure !== 'Traitor') {
      const gameChannel = createChannel(
        `game-${id}-${structure}`,
        'Ongoing Games',
        playerPerms
      );
      gameChannel.send(
        `This is the game channel for game ${id}. The game mode is ${structure}. Players: ` +
          players.forEach((playerId) => `<@${playerId}> `) +
          'Do `!game` to see a list of teams.'
      );
      if (gameInfo.structure === 'Zombies') {
        const zombie = players[Math.floor(Math.random() * players.length)];
        const { zombieName, zombieGameName } = await query(
          'SELECT name, game_name FROM users WHERE id = $1',
          [zombie]
        );
        gameChannel.send(
          `${zombieName} (${zombieGameName} in-game) is the zombie to begin this game.`
        );
      }
    }

    if (gameInfo.teams > 1) {
      for (const team of teams) {
        const teamIds = [
          team.player_id1,
          team.player_id2,
          team.player_id3,
          team.player_id4,
        ];
        const teamMembers = [];
        teamIds.forEach((memberId) => {
          if (memberId) {
            teamMembers.push(memberId);
          }
        });

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
            'Do `!game` to see a full list of players and teams.'
        );

        if (gameInfo.structure === 'Traitor') {
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

    if (
      gameInfo.structure === 'Werewolf' ||
      gameInfo.structure === 'Werewolves'
    ) {
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
          'Do `!game` to see a full list of players.'
      );
    } else if (gameInfo.structure === 'Make-Believe') {
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
    }
  },
};
