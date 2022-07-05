require('dotenv').config()
const { Client, Collection } = require('discord.js')
const bot = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] })
const fs = require('fs')
const prefix = process.env.PREFIX
const help = require('./commands/help')
const db = require('../db')

bot.commands = new Collection()
const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  bot.commands.set(command.name, command)
}

// --------------------------------------
//
//       EVENT ON LOGIN
//
// --------------------------------------
bot.once('ready', () => {
  bot.user.setActivity('$help', { type: 'PLAYING' })

  // eslint-disable-next-line no-console
  console.log(`Logged in as ${bot.user.username}`)
});

// --------------------------------------
//
//      EVENT ON MESSAGE
//
// --------------------------------------
bot.on('messageCreate', async message => {
  try {
    if (message.author.bot || !message.content.startsWith(prefix) || message.content === prefix)
      return

    // If it's a DM
    if (message.channel.type === 'dm') {
      const logMsg = []
      logMsg.push(`Content: ${message.content}`)
      logMsg.push(`DM from ${message.author}(${message.author.username})`)
      logMsg.push('<@217385992837922819>')

      message.channel.send('I do not support DM commands.\nYou can go into any server I\'m in and do `/help c` for help with my most common command.\nFor more meta discussions, you can find the PolyCalculator server with `/links` in any of those servers!')
        .catch(console.error)
      return feedbackChannel.send(logMsg).catch(console.error)
    }

    const textStr = message.cleanContent.slice(prefix.length)
    const commandName = textStr.split(/ +/).shift().toLowerCase();
    const argsStr = textStr.slice(commandName.length + 1)

    // Map all the commands
    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // Return if the command doesn't exist
    if (!command)
      return

    const generalDelete = 5000

    // Check if the user has the permissions necessary to execute the command
    if (!(command.permsAllowed !== 'VIEW_CHANNEL' || command.permsAllowed.some(x => message.member.permissions.has(x)) || command.usersAllowed.some(x => x === message.author.id)))
      return message.channel.send('Only an admin can use this command, sorry!')

    // EXECUTE COMMAND
    const replyObj = await command.execute(message)

    logUse(message, logChannel)

    replyObj.content.forEach(async other => {
      const warnings = await message.channel.send(other[0])

      if (replyObj.deleteContent)
        setTimeout(() => warnings.delete(), 15000)
    })

    if (replyObj.discord.description === undefined && replyObj.discord.title === undefined && replyObj.discord.fields.length === 0)
      return

    const msg = buildEmbed(replyObj)

    const replyMessage = await message.channel.send({ embeds: [msg] })

    return
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    if (error.stack)
      errorChannel.send(`**${message.cleanContent}** by ${message.author} (@${message.author.tag})\n${error}\n${message.url}`)

    return message.channel.send(`${error}`)
      .then().catch(console.error)
  }
})

bot.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (reaction.message.partial) await reaction.message.fetch();

    if (reaction.partial) await reaction.fetch();

    if (user.bot)
      return

    if (reaction.message.author.id !== bot.user.id)
      return

    if (reaction.emoji.name !== '🗑️')
      return

    const sql = 'SELECT author_id, message_id, is_slash FROM stats WHERE url = $1'
    const values = [reaction.message.url]
    const returned = await db.query(sql, values)
    let isUserRemoved = false

    if (!returned.rows[0])
      return

    const { author_id: userId, message_id: initialMessageId } = returned.rows[0]

    isUserRemoved = true && userId === user.id

    const memberRemoving = await reaction.message.guild.members.fetch(user.id)
    const canDelete = memberRemoving.permissions.has('MANAGE_MESSAGES')

    if (isUserRemoved || user.id === '217385992837922819' || canDelete)
      await reaction.message.delete()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error)
    // const pathArray = error.path.split('/')
    errorChannel.send(`${error.message}\n${error.stack}`)
  }
})

// --------------------------------------
//
//  EVENT ON NEW MEMBER IN DEV SERVER
//
// --------------------------------------

process.on('unhandledRejection', (code) => {
  // eslint-disable-next-line no-console
  console.log(`unhandledRejection: ${code.stack}`)
})

bot.login(process.env.TOKEN);