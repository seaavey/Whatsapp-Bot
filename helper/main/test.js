module.exports = {
  command: ["test"], // Command yang akan dijalankan
  description: "Test Command", // Deskripsi dari command
  category: "main", // Kategori dari command
  execute: async (m) => {
    // Fungsi yang akan dijalankan
    m.reply("Test Command");
  },
};
