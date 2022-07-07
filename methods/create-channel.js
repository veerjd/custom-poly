const { server, guild, Permissions } = require('discord.js');

module.exports = {
  createChannel: (channelName, categoryName, channelPerms) => {
    return guild.channels
      .create(channelName, {
        type: 'GUILD_TEXT',
        permissionOverwrites: channelPerms,
      })
      .then((channel) => {
        const cat = server.channels.cache.find(
          (c) => c.name == categoryName && c.type == 'category'
        );
        if (!cat) {
          // eslint-disable-next-line no-console
          console.log('Category could not be found.');
          return;
        }
        channel.setParent(cat.id);
      });
  },
};
