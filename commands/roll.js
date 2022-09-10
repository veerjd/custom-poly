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
    const args = message.content.split(' ');
    try {
      const size = args[1];
      if (size) {
        try {
          const dieSize = parseInt(size);
          const roll = Math.floor(Math.random() * dieSize) + 1;
          returnMsg = `*You rolled:* ${roll}`;
        } catch {
          returnMsg = `${size} is an invalid die size.`;
        }
      } else {
        returnMsg =
          'The `$roll` command takes a number as an argument. Do `$help roll` for more information.';
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
