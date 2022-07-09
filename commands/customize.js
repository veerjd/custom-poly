const { query } = require('../db');
const createChannel = require('../methods/create-channel');

module.exports = {
  name: 'customize',
  description:
    'Open a new custom game mode with the specified new name of the specified structure and size.',
  aliases: ['c', 'customgame', 'custommode'],
  shortUsage(prefix) {
    return `\`${prefix}c\``;
  },
  longUsage(prefix) {
    return `\`${prefix}customize\``;
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
        if (
          message.member.roles.cache.some((role) => role.name === 'customizer')
        ) {
          const newMode = args[1].toLowerCase();
          const struc = args[2].toLowerCase();
          let size;
          try {
            size = args[3];
          } catch {
            size = '';
          }

          if (newMode && struc) {
            let game;
            const gameId =
              (await query('SELECT id FROM games', [])).rows.reduce(
                (prevValue, curValue) => {
                  if (!prevValue || !prevValue.id) return curValue;
                  if (prevValue.id < curValue.id) return curValue;
                  return prevValue;
                }
              ) + 1;

            let newModeLetters = newMode.split('');
            let space = true;
            for (let i = 0; i < newModeLetters.length; i++) {
              if (newModeLetters[i] === '-' || newModeLetters[i] === '_') {
                newModeLetters[i] = ' ';
                space = true;
              } else if (space) {
                newModeLetters[i] = newModeLetters[i].toUpperCase();
                space = false;
              }
            }
            const newModeName = newModeLetters.join('');

            switch (struc) {
              case 'werewolf':
              case 'werewolves':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, $4)',
                    [gameId, newModeName + ' (Werewolf)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'bang':
              case 'bang!':
                if (size && size > 4) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, $4)',
                    [gameId, newModeName + ' (Bang!)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game that is at least 5. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'gameofthrones':
              case 'game-of-thrones':
              case 'game_of_thrones':
              case 'got':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, $4)',
                    [gameId, newModeName + ' (Game of Thrones)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'zombie':
              case 'zombies':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, $4)',
                    [gameId, newModeName + ' (Zombies)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'whereswaldo':
              case 'wheres-waldo':
              case 'wheres_waldo':
                if (size && size === 3) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, 3)',
                    [gameId, newModeName + ' (Where\'s Waldo?)', userId]
                  );
                } else {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, 2)',
                    [gameId, newModeName + ' (Where\'s Waldo?)', userId]
                  );
                }
                break;
              case 'traitor':
              case 'traitors':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 2, $4)',
                    [gameId, newModeName + ' (Traitor)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'ffa':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, $4)',
                    [gameId, newModeName + ' (FFA)', userId, size]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'teams':
              case 'teamgame':
                if (size) {
                  game = await query(
                    'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, $4, $5)',
                    [
                      gameId,
                      newModeName + ' (Teams)',
                      userId,
                      size.substring(0, 1),
                      size.substring(1, 2),
                    ]
                  );
                } else {
                  return [
                    'You need to specify a size for your new game. Do `!help open` for more information.',
                  ];
                }
                break;
              case 'towerdefense':
              case 'tower-defense':
              case 'tower_defense':
                game = await query(
                  'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, 4)',
                  [gameId, newModeName + ' (Tower Defense)', userId]
                );
                break;
              case 'powerbender':
                game = await query(
                  'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, 2)',
                  [gameId, newModeName + ' (Powerbender)', userId]
                );
                break;
              case 'makebelieve':
              case 'make-believe':
                game = await query(
                  'INSERT INTO games VALUES ($1, $2, "open", "unnamed", $3, 1, 7)',
                  [gameId, newModeName + ' (Make-Believe)', userId]
                );
                break;
              default:
                return [
                  'The `!customize` command takes a name for the new game mode and a game type as arguments. Do `!structures` to see a list of game types.',
                ];
            }

            returnMsg += `Successfully created ${game.structure} game ${gameId}.\nJoined you to game ${gameId}`;

            if (game.teams > 1) {
              const team = await query(
                'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, `A`, $2)',
                [gameId, [userId]]
              );
              returnMsg += ' on team A.';
            } else {
              const userName = (
                await query('SELECT name FROM users WHERE id = $1', [userId])
              ).rows[0].name;
              await query(
                'INSERT INTO teams (game_id, name, player_ids) VALUES ($1, $2, $3)',
                [gameId, userName, [userId]]
              );
              returnMsg += '.';
            }

            newModeLetters = newModeName.toLowerCase().split('');
            for (let i = 0; i < newModeLetters.length; i++) {
              if (newModeLetters[i] === ' ') {
                newModeLetters[i] = '-';
              } else if (
                newModeLetters[i].toUpperCase() === newModeLetters[i]
              ) {
                newModeLetters[i] = '';
              }
            }
            createChannel(newModeLetters.join(''), 'Customizers Corner', []);
          } else {
            returnMsg =
              'The `!customize` command takes a name for the new game mode and a game type as arguments. Do `!structures` to see a list of game types.';
          }
        } else {
          returnMsg =
            'You must have the customizer role to use this command. Ask a helper to give it to you.';
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
