const { getUrl, fetchJson } = require("@seaavey/wafunc");

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

      const { title, thumbnail, duration } = await fetchJson(
        `https://ytdl.nvlgroup.my.id/info?url=${url}`
      );

      const dura = timeToSeconds(duration);

      if (dura > 600) return m.reply("Durasi Video Terlalu Panjang!");

      await conn.sendAds(m.from, null, m, {
        title,
        thumbnailUrl: thumbnail,
        renderLargerThumbnail: true,
      });

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

function timeToSeconds(time) {
  const [hours, minutes, seconds] = time.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
}
