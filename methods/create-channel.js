module.exports = {
  createChannel: (guild, channelName, categoryName, channelPerms) => {
    return guild.channels
      .create({
        name: channelName,
        permissionOverwrites: channelPerms,
      })
      .then((channel) => {
        const cat = guild.channels.cache.find(
          (c) => c.name == categoryName && c.type == 'category'
        );
        if (!cat) {
          console.log('Category could not be found.');
          return;
        }
        channel.setParent(cat.id);
      })
      .catch(console.error);
  },
};
