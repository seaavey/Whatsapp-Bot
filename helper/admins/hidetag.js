module.exports = {
  command: ["hidetag", "ht"],
  description: "Hidetag",
  category: "Admins",
  execute: async (m, { conn }) => {
    if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan dalam grup");
    if (!m.isAdmin)
      return m.reply("Hanya admin yang bisa menggunakan fitur ini");
    if (!m.isBotAdmin)
      return m.reply("Bot bukan admin, tidak bisa menggunakan fitur ini");

    await conn.sendMessage(m.from, {
      text: m.quoted ? m.quoted.body : m.text,
      mentions: m.metadata.participants.map((a) => a.id),
    });
  },
};
