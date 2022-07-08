const { query } = require('../db');

module.exports = {
  name: 'register',
  description:
    'Register yourself in my database. Must specify your in-game name.',
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
    const args = message.split(' ');
    try {
      const userId = message.author.id;
      const existingUser = (
        await query('SELECT user_id FROM users WHERE user_id = $1', [userId])
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
        returnMsg =
          'You are already registered. Use `!update` to update your information.';
      }
    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
