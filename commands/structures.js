const structures = require('../structures.json');

module.exports = {
  name: 'structures',
  description: 'View a list of game modes.',
  aliases: ['modes', 'gamemodes', 'types', 'gametypes', 's'],
  shortUsage(prefix) {
    return `\`${prefix}s\``;
  },
  longUsage(prefix) {
    return `\`${prefix}structures\``;
  },
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    try {
      returnMsg += '**__Structures List__**\n';
      for (const struc of structures) {
        if(struc.mode === 'FFA') {
          returnMsg += '\n';
        }
        returnMsg += `\n__${struc.mode}:__ ${struc.description}`;
        if (struc.channel) {
          returnMsg += ` (<#${struc.channel}>)`;
        }
      }
    } catch (error) {
      throw error;
    }

    return [].push(returnMsg);
  },
};
