const { query } = require('../db');

module.exports = {
  name: '',
  description: 'Update your user registration. May specify your in-game name.',
  aliases: [],
  shortUsage(prefix) {
    return `\`${prefix}___\``;
  },
  longUsage(prefix) {
    return `\`${prefix}___\``;
  },
  category: '',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ');
    try {

    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
