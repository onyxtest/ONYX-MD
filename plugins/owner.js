const { cmd } = require('../command');
const config = require('../config');
const { jidNormalizedUser } = require("@whiskeysockets/baileys");



cmd({
    pattern: "owner",
    alias: ["creator"],
    react: "👑",
    desc: "Show the bot owner's contact.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { reply }) => {
    try {
        await reply(`👑 *Bot Owner:* wa.me/${config.OWNER_NUM}`);
    } catch (e) {
        console.error("Owner Command Error:", e);
        reply("❌ Failed to fetch owner info.");
    }
});

cmd({
    pattern: "block",
    alias: ["ban"],
    react: "🚫",
    desc: "Owner-only: Block the current chat user (use in private chat)",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isOwner, isGroup, reply }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        if (isGroup) return reply("⚠️ Use this command in a private chat with the user you want to block.");
        let target = from;
        target = jidNormalizedUser(target);
        await robin.updateBlockStatus(target, "block");
        return reply(`✅ Successfully blocked this chat: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block the user. Error: ${e.message}`);
    }
});

cmd({
    pattern: "kick",
    alias: ["remove"],
    react: "👢",
    desc: "Owner-only: Remove mentioned users or the replied user from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to kick users!");

        let usersToKick = [];
        // Check for mentioned users
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            usersToKick = m.mentionedJid.map(jidNormalizedUser);
        } else if (quoted && quoted.sender) {
            usersToKick = [jidNormalizedUser(quoted.sender)];
        }

        if (usersToKick.length === 0) {
            return reply("⚠️ Please mention the user(s) or reply to their message to kick!");
        }

        // Prevent kicking the bot itself
        const botId = robin.user.id.split(":")[0] + "@s.whatsapp.net";
        if (usersToKick.includes(botId)) {
            return reply("🤖 I can't kick myself!");
        }

        await robin.groupParticipantsUpdate(from, usersToKick, "remove");
        const usernames = usersToKick.map(jid => `@${jid.split('@')[0]}`);
        return reply(`${usernames.join(", ")} has been kicked successfully!`);
    } catch (e) {
        console.error("Kick Error:", e);
        return reply("❌ Failed to kick user(s)!");
    }
});
