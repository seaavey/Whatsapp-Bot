const { getUrl, fetchJson } = require("@seaavey/wafunc");

module.exports = {
  command: ["igdl", "ig", "instagram"],
  category: "Downloader",
  description: "Download media dari Instagram",
  execute: async (m, { conn }) => {
    try {
      console.log(JSON.stringify(m, null, 2));
      const url = await getUrl(m.quoted ? m.quoted.body : m.body);

      if (!url) return m.reply("Url Tidak Ditemukan!");

      if (!/instagram.com/.test(url)) return m.reply("Url Tidak Valid!");

      const { result } = await fetchJson(
        `https://btch.us.kg/download/igdl?url=${url}`
      );

      m.react("📥");
      if (!result) return m.reply("Mohon Maaf, Terjadi Kesalahan!");

      const array = [];
      const set = new Set();

      result.forEach((item) => {
        if (!set.has(item.url)) {
          set.add(item.url);
          array.push(item.url);
        }
      });

      if (array.length === 0) return m.reply("Media Tidak Ditemukan!");

      for (let i = 0; i < a.length; i++) {
        if (a[i].includes("https://scontent.cdninstagram.com")) {
          await conn.sendImage(m.from, a[i], null, m);
        } else {
          await conn.sendVideo(m.from, a[i], null, m);
        }
      }
    } catch (e) {
      console.error(e);
      return m.reply("Terjadi Kesalahan!");
      m.react("❌");
    }
  },
};
