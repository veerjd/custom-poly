module.exports = {
  name: 'about',
  description: 'About me.',
  aliases: ['a'],
  shortUsage(prefix) {
    return `\`${prefix}a\``;
  },
  longUsage(prefix) {
    return `\`${prefix}about\``;
  },
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    return [
      `A bot to track games and wins for CustomPoly. My prefix is ${process.env.prefix}.`,
    ];
  },
};
