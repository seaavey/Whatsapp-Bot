const { packName, packPublish } = require("@/config");
const { writeExif } = require("@/utils/sticker");

module.exports = {
  command: ["sticker", "s"],
  category: "Converter",
  description: "Convert image to sticker",
  execute: async (m, { conn }) => {
    try {
      const q = m.quoted ? m.quoted : m;
      if (/image|video|webp/.test(q.msg.mimetype)) {
        let media = await conn.downloadMediaMessage(q);
        if (q.msg?.seconds > 10) return m.reply("Maximal 10 detik!");

        m.react("🔄");

        let exif = {
          packName,
          packPublish,
        };

        let sticker = await writeExif(
          { mimetype: q.msg.mimetype, data: media },
          exif
        );
        await m.reply({ sticker });
      }
    } catch (e) {
      m.reply("Mohon maaf, terjadi kesalahan!");
      console.error(e);
      m.react("❌");
    }
  },
};
