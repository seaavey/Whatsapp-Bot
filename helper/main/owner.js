const { owner } = require("@/config");

module.exports = {
  command: ["owner", "creator"],
  category: "Main",
  description: "Show the creator of the bot",
  execute: async (m, { conn }) => {
    await conn.sendContact(m.from, owner, m);
  },
};
