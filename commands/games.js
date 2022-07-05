module.exports = {
    name: 'games',
    description: 'See available games.',
    aliases: ['gs'],
    shortUsage(prefix) {
        return `\`${prefix}gs\``
    },
    longUsage(prefix) {
        return `\`${prefix}games\``
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