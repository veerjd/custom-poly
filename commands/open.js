const { query } = require('../db');
const { nextTeamId } = require('../methods/last-team');

module.exports = {
  name: 'open',
  description: 'Open a new game of the specified structure and size.',
  aliases: ['o', 'opengame', 'newgame'],
  shortUsage(prefix) {
    return `\`${prefix}o\``;
  },
  longUsage(prefix) {
    return `\`${prefix}open\``;
  },
  example: 'open werewolf 8',
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const userId = message.author.id;
      const checkUser = (
        await query('SELECT id FROM players WHERE user_id = $1', [userId])
      ).rows;
      if (checkUser.length === 1) {
        const playerId = checkUser[0].id;
        const struc = args[1].toLowerCase();
        let size;
        try {
          size = parseInt(args[2]);
        } catch {
          size = 0;
        }
        if (struc) {
          const gameId =
            (await query('SELECT id FROM games', [])).rows.reduce(
              ((prevValue, curValue) => {
                if (!prevValue || !prevValue.id) return curValue;
                if (prevValue.id < curValue.id) return curValue;
                return prevValue;
              }), { id: 0 }
            ).id + 1;

          switch (struc) {
            case 'werewolf':
            case 'werewolves':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Werewolf\', \'open\', \'unnamed\', $2, 1, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Werewolf game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'bang':
            case 'bang!':
              if (size && size > 4) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Bang!\', \'open\', \'unnamed\', $2, 1, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Bang! game that is at least 5. Do `$help open` for more information.',
                ];
              }
              break;
            case 'gameofthrones':
            case 'game-of-thrones':
            case 'game_of_thrones':
            case 'got':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Game of Thrones\', \'open\', \'unnamed\', $2, 1, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Game of Thrones game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'zombie':
            case 'zombies':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Zombies\', \'open\', \'unnamed\', $2, 1, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Zombies game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'whereswaldo':
            case 'wheres-waldo':
            case 'wheres_waldo':
              if (size && size === 3) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Where\'s Waldo?\', \'open\', \'unnamed\', $2, 1, 3)',
                  [gameId, playerId]
                );
              } else {
                await query(
                  'INSERT INTO games VALUES ($1, \'Where\'s Waldo?\', \'open\', \'unnamed\', $2, 1, 2)',
                  [gameId, playerId]
                );
              }
              break;
            case 'traitor':
            case 'traitors':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Traitor\', \'open\', \'unnamed\', $2, 2, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Traitor game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'ffa':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'FFA\', \'open\', \'unnamed\', $2, 1, $3)',
                  [gameId, playerId, size]
                );
              } else {
                return [
                  'You need to specify a size for your FFA game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'teams':
            case 'teamgame':
              if (size) {
                await query(
                  'INSERT INTO games VALUES ($1, \'Teams\', \'open\', \'unnamed\', $2, $3, $4)',
                  [gameId, playerId, size.substring(0, 1), size.substring(1, 2)]
                );
              } else {
                return [
                  'You need to specify a size for your team game. Do `$help open` for more information.',
                ];
              }
              break;
            case 'towerdefense':
            case 'tower-defense':
            case 'tower_defense':
              await query(
                'INSERT INTO games VALUES ($1, \'Tower Defense\', \'open\', \'unnamed\', $2, 1, 4)',
                [gameId, playerId]
              );
              break;
            case 'powerbender':
              await query(
                'INSERT INTO games VALUES ($1, \'Powerbender\', \'open\', \'unnamed\', $2, 1, 2)',
                [gameId, playerId]
              );
              break;
            case 'makebelieve':
            case 'make-believe':
              await query(
                'INSERT INTO games VALUES ($1, \'Make-Believe\', \'open\', \'unnamed\', $2, 1, 7)',
                [gameId, playerId]
              );
              break;
            default:
              return [
                'The `$open` command takes a game type as an argument. Do `$structures` to see a list of game types.',
              ];
          }

          const game = (await query('SELECT * FROM games WHERE id = $1', [gameId])).rows[0];
          returnMsg += `Successfully created ${game.structure} game ${gameId}.\nJoined you to game ${gameId}`;

          if (game.teams > 1) {
            await query(
              'INSERT INTO teams VALUES ($1, $2, `A`, $3)',
              [(await nextTeamId()), gameId, [playerId]]
            );
            returnMsg += ' on team A.';
          } else {
            const userName = (
              await query('SELECT name FROM players WHERE id = $1', [playerId])
            ).rows[0].name;
            await query('INSERT INTO teams VALUES ($1, $2, $3, $4)', [
              (await nextTeamId()),
              gameId,
              userName,
              [playerId],
            ]);
            returnMsg += '.';
          }
        } else {
          returnMsg =
            'The `$open` command takes a game type as an argument. Do `$structures` to see a list of game types.';
        }
      } else {
        returnMsg =
          'You must be registered with me to open a game. Do `$help register` for more information.';
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
