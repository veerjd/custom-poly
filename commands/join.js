module.exports = {
    name: 'join',
    description: 'Join a game.',
    aliases: ['j'],
    shortUsage(prefix) {
        return `\`${prefix}j\``
    },
    longUsage(prefix) {
        return `\`${prefix}join\``
    },
    category: 'Main',
    // category: 'Paid',
    permsAllowed: ['VIEW_CHANNEL'],
    usersAllowed: ['217385992837922819'],
    execute: async function (message) {
        const returnMsg = []
        try {

        } catch (error) {
            throw error
        }

        return returnMsg
    }
};