module.exports = {
  name: 'pustomcoly',
  description: 'It\'s a secret...',
  aliases: ['pc'],
  shortUsage(prefix) {
    return `\`${prefix}pc\``;
  },
  longUsage(prefix) {
    return `\`${prefix}pustomcoly\``;
  },
  category: '',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    try {
      returnMsg = 'Well done, you found the Easter egg! Here\'s a neat video to check out: https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
