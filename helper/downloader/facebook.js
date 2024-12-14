const { getUrl, fetchJson } = require("@seaavey/wafunc");

const regex =
  /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:facebook|fb).com\/(?:.*\/)?(?:video|watch|story)(?:.*\/)?(?:\?v=|&v=|\/)?(\d+)(?:.*\/)?/i;

module.exports = {
  command: ["fbdl", "fb", "facebook"],
  category: "Downloader",
  description: "Download media dari Facebook",
  execute: async (m, { conn }) => {
    const url = await getUrl(m.quoted ? m.quoted.body : m.body);

    if (!url) return m.reply("Mohon Maaf, Url Tidak Ditemukan!");

    if (!regex.test(url))
      return m.reply("Mohon Maaf, Url Kamu Berikan Tidak Valid!");

    const { result } = await fetchJson(
      `https://btch.us.kg/download/fbdl?url=${url}`
    );

    m.react("🔄");

    m.reply("Sedang Mengunduh...");

    if (!result.Normal_video) return m.reply("Maaf, Video Tidak Ditemukan!");

    await conn.sendVideo(m.from, result.Normal_video, null, m);
  },
};
