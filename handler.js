const { LoadCommand } = require("@/utils/helper");
const { pathToFileURL } = require("url");

const Logger = require("@/utils/logger");
const os = require("os");

module.exports = async (conn, m, store) => {
  const isCommand = (m.prefix && m.body.startsWith(m.prefix)) || false;

  await Logger(m, conn);

  try {
    const command = await LoadCommand();

    if (!isCommand) return;

    const cmd = command.find((cmd) =>
      cmd.command.some((c) => c === m.command.toLowerCase())
    );

    if (!cmd) return;

    if (os.platform() !== "win32")
      cmd.location = pathToFileURL(cmd.location.replace(/\\/g, "/")).href;

    if (cmd.error)
      return m.reply("Mohon Maaf Command ini sedang dalam perbaikan");

    const handler = require(cmd.location);

    let req = {
      conn,
      store,
    };

    await handler.execute(m, req);
  } catch (e) {
    console.error(e);
  }
};
