const { query } = require('../db');

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
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ');
    try {
      const userId = message.author.id;
      const checkUser = (
        await query('SELECT id FROM users WHERE id = $1', [userId])
      ).rows.length;
      if (checkUser === 1) {
        const struc = args[1].toLowerCase();
        let size;
        try {
          size = args[2];
        } catch {
          size = '';
        }
        if (struc) {
          let game;
          const gameId =
            (await query('SELECT id FROM games', [])).rows.reduce(
              (prevValue, curValue) => {
                if (!prevValue || !prevValue.id) return curValue;
                if (prevValue.id < curValue.id) return curValue;
                return prevValue;
              }
            ) + 1;

          switch (struc) {
            case 'werewolf':
            case 'werewolves':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Werewolf", "open", "unnamed", $2, 1, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Werewolf game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'bang':
            case 'bang!':
              if (size && size > 4) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Bang!", "open", "unnamed", $2, 1, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Bang! game that is at least 5. Do `!help open` for more information.',
                ];
              }
              break;
            case 'gameofthrones':
            case 'game-of-thrones':
            case 'game_of_thrones':
            case 'got':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Game of Thrones", "open", "unnamed", $2, 1, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Game of Thrones game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'zombie':
            case 'zombies':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Zombies", "open", "unnamed", $2, 1, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Zombies game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'whereswaldo':
            case 'wheres-waldo':
            case 'wheres_waldo':
              if (size && size === 3) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Where\'s Waldo?", "open", "unnamed", $2, 1, 3)',
                  [gameId, userId]
                );
              } else {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Where\'s Waldo?", "open", "unnamed", $2, 1, 2)',
                  [gameId, userId]
                );
              }
              break;
            case 'traitor':
            case 'traitors':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Traitor", "open", "unnamed", $2, 2, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your Traitor game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'ffa':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "FFA", "open", "unnamed", $2, 1, $3)',
                  [gameId, userId, size]
                );
              } else {
                return [
                  'You need to specify a size for your FFA game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'teams':
            case 'teamgame':
              if (size) {
                game = await query(
                  'INSERT INTO games VALUES ($1, "Teams", "open", "unnamed", $2, $3, $4)',
                  [gameId, userId, size.substring(0, 1), size.substring(1, 2)]
                );
              } else {
                return [
                  'You need to specify a size for your team game. Do `!help open` for more information.',
                ];
              }
              break;
            case 'towerdefense':
            case 'tower-defense':
            case 'tower_defense':
              game = await query(
                'INSERT INTO games VALUES ($1, "Tower Defense", "open", "unnamed", $2, 1, 4)',
                [gameId, userId]
              );
              break;
            case 'powerbender':
              game = await query(
                'INSERT INTO games VALUES ($1, "Powerbender", "open", "unnamed", $2, 1, 2)',
                [gameId, userId]
              );
              break;
            case 'makebelieve':
            case 'make-believe':
              game = await query(
                'INSERT INTO games VALUES ($1, "Make-Believe", "open", "unnamed", $2, 1, 7)',
                [gameId, userId]
              );
              break;
            default:
              return ['The `!open` command takes a game type as an argument. Do `!structures` to see a list of game types.'];
          }

          returnMsg += `Successfully created ${game.structure} game ${gameId}.\nJoined you to game ${gameId}`;

          if (game.teams > 1) {
            const team = await query(
              'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, `A`, $2)',
              [gameId, [userId]]
            );
            returnMsg += ' on team A.';
          } else {
            const userName = (await query('SELECT name FROM users WHERE id = $1', [userId])).rows[0].name;
            await query(
              'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, $2, $3)',
              [gameId, userName, [userId]]
            );
            returnMsg += '.';
          }
        } else {
          returnMsg =
            'The `!open` command takes a game type as an argument. Do `!structures` to see a list of game types.';
        }
      } else {
        returnMsg =
          'You must be registered with me to open a game. Do `!help register` for more information.';
      }
    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
