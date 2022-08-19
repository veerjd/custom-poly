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
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    try {
      const userId = message.author.id;
      const existingUser = (
        await query('SELECT id FROM users WHERE id = $1', [userId])
      ).rows;
      if (existingUser.length === 0) {
        const userGameName = args[1];
        if (userGameName || mod) {
          const userName = message.member.nickname;
          await query('INSERT INTO users VALUES ($1, $2, $3, 0, 0)', [
            userId,
            userName,
            userGameName,
          ]);
          returnMsg = `Successfully added you to my database with in-game name ${userGameName}.`;
        } else {
          returnMsg =
            '`!register` takes your in-game name as an argument. Do `!help register` for more information.';
        }
      } else {
        const userGameName = args[1];
        const userName = message.member.nickname;
        if (userGameName || mod) {
          await query(
            'UPDATE users SET name = $1, game_name = $2 WHERE id = $3',
            [userName, userGameName, userId]
          );
        } else {
          await query('UPDATE users SET name = $1 WHERE id = $2', [
            userName,
            userId,
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
