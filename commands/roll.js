module.exports = {
  name: 'roll',
  description: 'Roll a die of the specified size.',
  aliases: ['r', 'die'],
  shortUsage(prefix) {
    return `\`${prefix}r\``;
  },
  longUsage(prefix) {
    return `\`${prefix}roll\``;
  },
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ');
    try {
      const size = args[1];
      if (size) {
        if (Number.isSafeInteger(size)) {
          const roll = Math.floor(Math.random() * size) + 1;
          returnMsg = `*You rolled:* ${roll}`;
        } else {
          returnMsg = `${size} is an invalid die size.`;
        }
      } else {
        returnMsg =
          'The `!roll` command takes a number as an argument. Do `!help roll` for more information.';
      }
    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
