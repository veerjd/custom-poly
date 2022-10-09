const { query } = require('../db');

module.exports = {
  name: 'register',
  description:
    'Register yourself or update your registry in my database. Must specify your in-game name.',
  aliases: ['rg'],
  shortUsage(prefix) {
    return `\`${prefix}rg\``;
  },
  longUsage(prefix) {
    return `\`${prefix}register\``;
  },
  example: 'register myName',
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const userId = message.author.id;
      const existingUser = (
        await query('SELECT id FROM players WHERE user_id = $1', [userId])
      ).rows;
      if (existingUser.length === 0) {
        const userGameName = args.slice(1, args.length).join(' ');
        if (userGameName || mod) {
          let userName = message.member.nickname;
          if (!userName) {
            userName = message.member.user.username;
          }

          const playerId =
            (await query('SELECT id FROM players', [])).rows.reduce(
              (prevValue, curValue) => {
                if (!prevValue || !prevValue.id) return curValue;
                if (prevValue.id < curValue.id) return curValue;
                return prevValue;
              },
              { id: 0 }
            ).id + 1;
          await query('INSERT INTO players VALUES ($1, $2, $3, $4, 0, 0)', [
            playerId,
            userId,
            userName,
            userGameName,
          ]);
          returnMsg = `Successfully added you to my database with in-game name ${userGameName}.`;
        } else {
          returnMsg =
            '`$register` takes your in-game name as an argument. Do `$help register` for more information.';
        }
      } else {
        const playerId = existingUser[0].id;
        const userGameName = args[1];

        let userName = message.member.nickname;
        if (!userName) {
          userName = message.member.user.username;
        }

        if (userGameName || mod) {
          await query(
            'UPDATE players SET name = $1, game_name = $2 WHERE id = $3',
            [userName, userGameName, playerId]
          );
        } else {
          await query('UPDATE players SET name = $1 WHERE id = $2', [
            userName,
            playerId,
          ]);
        }
        returnMsg = 'Successfully updated your information in my database.';
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
