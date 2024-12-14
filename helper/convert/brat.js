const { fetchBuffer } = require("@seaavey/wafunc");
const { writeExif } = require("@/utils/sticker");
const { packName, packPublish } = require("@/config");

module.exports = {
  command: ["brat"],
  category: "Converter",
  description: "Convert text to braille",
  execute: async (m) => {
    try {
      if (!m.text) return m.reply("Masukkan teks yang ingin diubah ke brat");

      await m.react("🔄");

      let res = await fetchBuffer(
        `https://api.ryochinel.my.id/api/brat?text=${m.text}`
      ); // Powered By ryochinel ( My Friend )

      let sticker = await writeExif(res, {
        packName,
        packPublish,
      });

      m.reply({ sticker });
    } catch (e) {
      console.error(e);
      m.reply("Mohon maaf, terjadi kesalahan");
      m.react("❌");
    }
  },
};
