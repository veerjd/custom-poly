module.exports = {
  name: 'profile',
  description: "View a user's profile.",
  aliases: [],
  shortUsage(prefix) {
    return `\`${prefix}___\``;
  },
  longUsage(prefix) {
    return `\`${prefix}___\``;
  },
  category: 'Main',
  // category: 'Paid',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819'],
  execute: async function (message) {
    const returnMsg = [];
    try {
    } catch (error) {
      throw error;
    }

    return returnMsg;
  },
};
