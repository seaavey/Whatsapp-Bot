const { getUrl, fetchJson, timeToSeconds } = require("@seaavey/wafunc");

module.exports = {
  command: ["ytmp3"],
  category: "Downloader",
  description: "Download audio dari YouTube",
  execute: async (m, { conn }) => {
    try {
      const url = await getUrl(m.quoted ? m.quoted.body : m.body);

      if (!url) return m.reply("Url Tidak Ditemukan!");

      m.reply("Mohon Tunggu, Sedang Mendownload...");
      m.react("📥");

      const { duration } = await fetchJson(
        `https://ytdl.nvlgroup.my.id/info?url=${url}`
      );

      const dura = timeToSeconds(duration);

      if (dura > 600) return m.reply("Durasi Video Terlalu Panjang!");

      await conn.sendAudio(
        m.from,
        `https://ytdl.nvlgroup.my.id/audio?url=${url}&bitrate=320`,
        m,
        {
          ptt: false,
        }
      );
    } catch (e) {
      console.error(e);
      m.reply("Terjadi Kesalahan!");
      m.react("❌");
    }
  },
};
