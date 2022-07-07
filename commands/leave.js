module.exports = {
  name: 'leave',
  description: 'Leave an open game. Must specify a game ID. IF the game has already started, ask the host or a mod to remove you.',
  aliases: ['l', 'leavegame'],
  shortUsage(prefix) {
    return `\`${prefix}l\``;
  },
  longUsage(prefix) {
    return `\`${prefix}leave\``;
  },
  category: 'Games',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ').shift();
    try {

    } catch (error) {
      throw error;
    }

    const returnArray = [].push(returnMsg);
    return returnArray;
  },
};