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
  category: 'Info',
  permsAllowed: ['VIEW_CHANNEL'],
  usersAllowed: ['217385992837922819', '776656382010458112'],
  execute: async (message, mod) => {
    let returnMsg = '';
    const args = message.content.split(' ');
    const { commands } = message.client;

    try {
      if (args[1]) {
        const cmd =
          commands.get(args[1]) ||
          commands.find(
            (cmnd) => cmnd.aliases && cmnd.aliases.includes(args[1])
          );
        const prefix = process.env.PREFIX;
        if (cmd) {
          returnMsg += `**${cmd.name}** \n${
            cmd.description
          } \n__Long form:__ ${cmd.longUsage(
            prefix
          )} \n__Short form:__ ${cmd.shortUsage(prefix)} \n__Aliases:__ `;
          for (const alias of cmd.aliases) {
            returnMsg += alias + ', ';
          }
          returnMsg = returnMsg.substring(0, returnMsg.length - 2);
          if (cmd.example) {
            returnMsg += `\n__Example usage:__ \`${prefix + cmd.example}\``;
          }
        } else {
          returnMsg = `That command was not found. Run \`${prefix}help\` to view all of my commands.`;
        }
      } else {
        const categoriesMapped = {
          Info: {},
          Games: {},
        };

        commands.forEach((cmd) => {
          if (!cmd.category) return;
          const category = categoriesMapped[cmd.category];
          category[cmd.name] = {
            name: cmd.name,
            description: cmd.description,
          };
        });

        returnMsg += '*Help for All Commands*\n';

        for (const [cat, commandsList] of Object.entries(categoriesMapped)) {
          returnMsg += `\n**__${cat}__** \n`;
          for (const [name, details] of Object.entries(commandsList)) {
            returnMsg += `**${name}**: ${details.description} \n`;
          }
        }

        returnMsg += `\nFor more help on a command, use ${process.env.PREFIX}help {command}.`;
      }
    } catch (error) {
      throw error;
    }

    return [returnMsg];
  },
};
