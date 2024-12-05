const Color = require("./color");
const moment = require("moment-timezone");

module.exports = function Logger(m, conn) {
  const timestamp = moment.tz("Asia/Jakarta").format("HH:mm:ss");
  const sender = conn.getName ? conn.getName(m.sender) : "Unknown";
  const chatType = m.isGroup ? "Group" : "Private";
  const messageType = m.type
    ? m.type.charAt(0).toUpperCase() + m.type.slice(1)
    : "Unknown";

  if (m.key?.fromMe) return;

  console.log("\n" + "=".repeat(50));
  console.log(
    `${Color.gray(
      `[${timestamp} || ${moment().format("DD/MM/YYYY")} || ${m.id || "N/A"}]`
    )}`
  );

  console.log(
    `${Color.cyan("From:")} ${Color.cyan(
      conn.getName ? conn.getName(m.from) : "Unknown"
    )} ${Color.blueBright(`(${m.from || "N/A"})`)}`
  );

  console.log(`${Color.blue("Device:")} ${Color.blue(m.device || "Unknown")} `);

  console.log(
    `${Color.yellow("Chat:")} ${Color.yellow(chatType)} ${
      m.isGroup
        ? Color.yellow(
            `(${sender} in ${conn.getName ? conn.getName(m.from) : "Unknown"})`
          )
        : ""
    }`
  );

  console.log(`${Color.magenta("Type:")} ${Color.magenta(messageType)}`);

  console.log(
    `${Color.green("Message:")} ${Color.green(
      (m.body || m.type || "No message content").trim()
    )}`
  );

  if (m.quoted) {
    console.log(
      `${Color.red("Replying to:")} ${Color.red(
        m.quoted.sender
          ? conn.getName
            ? conn.getName(m.quoted.sender)
            : "Unknown"
          : "Unknown"
      )}`
    );
    console.log(
      `${Color.red("Quoted message:")} ${Color.red(
        m.quoted.text || "<No text content>"
      )}`
    );
  }

  console.log("=".repeat(50) + "\n");
};
