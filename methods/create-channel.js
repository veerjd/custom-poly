const { CategoryChannel } = require('discord.js');

module.exports = {
  createChannel: async (guild, channelName, categoryName, channelPerms) => {
    const newChannel = await guild.channels
      .create(channelName, {
        permissionOverwrites: channelPerms,
      })
      .catch(console.error);

    const cat = guild.channels.cache.find(
      (c) => c.name == categoryName
    );
    if (!cat) {
      console.log('Category could not be found.');
      return;
    }
    newChannel.setParent(cat.id);
  },
};
