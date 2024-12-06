const { toUpper } = require("@seaavey/wafunc");

module.exports = {
  command: ["add", "promote", "demote", "kick"],
  description: "Admin Command",
  category: "Admins",
  execute: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Fitur ini hanya bisa diakses dalam grup!");
    if (!m.isAdmin)
      return m.reply("Fitur ini hanya bisa diakses oleh admin grup!");
    if (!m.isBotAdmin) return m.reply("Jadikan bot sebagai admin grup!");

    const user = m.text
      ? m.text
      : m.quoted
      ? m.quoted.sender
      : m.mentionedJid.length > 0
      ? m.mentioneJid[0]
      : false;
    const jid = user.trim();

    const actions = (action) => {
      conn
        .groupParticipantsUpdate(m.from, [jid], action)
        .then(() => {
          m.reply(`Berhasil ${toUpper(action)} member!`);
        })
        .catch(() => {
          m.reply(`Gagal ${toUpper(action)} member!`);
        });
    };

    if (m.command === "add") {
      actions("add");
    } else if (m.command === "promote") {
      actions("promote");
    } else if (m.command === "demote") {
      actions("demote");
    } else if (m.command === "kick") {
      actions("remove");
    }
  },
};
