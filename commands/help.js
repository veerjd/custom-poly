module.exports = {
  name: 'help',
  description:
    'Get help running my commands. May specify a command to get information on.',
  aliases: ['h'],
  shortUsage(prefix) {
    return `\`${prefix}h\``;
  },
  longUsage(prefix) {
    return `\`${prefix}help\``;
  },
  category: 'Main',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.split(' ').shift();
    const { commands } = message.client;

    try {
      if (args[0]) {
        const cmd =
          commands.get(args[0]) ||
          commands.find(
            (cmnd) => cmnd.aliases && cmnd.aliases.includes(args[0])
          );
        if (cmd) {
          returnMsg += `**${cmd.name}** \n${cmd.description} \n*Aliases:* `;
          for (const alias of cmd.aliases) {
            returnMsg += `${alias}, `;
          }
          returnMsg.substring(0, returnMsg.length - 2);
          returnMsg += `\nLong form: ${cmd.longUsage} \nShort form: ${cmd.shortUsage}`;
        } else {
          returnMsg = `That command was not found. Run \`${process.env.prefix}help\` to view all of my commands.`;
        }
      } else {
        const categoriesMapped = {
          Main: {},
          Games: {},
        };

        commands.forEach((cmd) => {
          const category = categoriesMapped[cmd.category];
          category[cmd.name] = {
            name: cmd.name,
            description: cmd.description,
          };
        });

        returnMsg += 'Help card for all commands\n';

        for (const [cat, commandsList] of Object.entries(categoriesMapped)) {
          returnMsg += `\n**${cat}** \n`;
          for (const [name, details] of Object.entries(commandsList)) {
            returnMsg += `**${name}**: ${details.description} \n`;
          }
        }

        returnMsg += `For more help on a command, use ${process.env.PREFIX}help {command}.`;
      }
    } catch (error) {
      throw error;
    }

    const returnArray = [].push(returnMsg);
    return returnArray;
  },
};
