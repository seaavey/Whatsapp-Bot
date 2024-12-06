const fs = require("fs");
const path = require("path");

const readFiles = (locationFiles) => {
  return fs.readFileSync(locationFiles, "utf-8");
};

const LoadCommand = () => {
  const dir = fs.readdirSync(path.join(process.cwd(), "helper"));
  const folder = dir.filter((v) =>
    fs.lstatSync(path.join(process.cwd(), "helper", v)).isDirectory()
  );
  const js = {};

  for (const v of folder) {
    const file = fs.readdirSync(path.join(process.cwd(), "helper", v));
    const jsFile = file.filter((f) => f.endsWith(".js"));
    js[v] = jsFile.map((f) => path.join(process.cwd(), "helper", v, f));
    delete js["_event"]; // delete this if you don't have it
  }

  const command = [];

  for (const [key, value] of Object.entries(js)) {
    for (const v of value) {
      const readFile = fs.readFileSync(v, "utf-8");
      const commandMatch = readFile.match(/command:\s*\[([^\]]+)\]/);
      const categoryMatch = readFile.match(/category:\s*['"](.*?)['"]/);

      if (!commandMatch) continue;

      const commandsArray = commandMatch[1]
        .split(",")
        .map((cmd) => cmd.replace(/['"]/g, "").trim());

      command.push({
        command: commandsArray,
        category: categoryMatch ? categoryMatch[1] : "Unknown",
        location: v,
        description: getDesc(commandsArray[0]),
      });
    }
  }

  return command;
};

const getDesc = (command) => {
  const folder = fs
    .readdirSync(process.cwd() + "/helper")
    .filter((file) => file.endsWith(".js"));

  for (const file of folder) {
    const readFile = readFiles(process.cwd() + "/helper/" + file);
    const commandMatch = readFile.match(/command:\s*\[['"](.*?)['"]\]/);

    if (!commandMatch) continue;

    const commandName = commandMatch[1];
    if (commandName === command) {
      const descMatch = readFile.match(/description:\s*['"](.*?)['"]/);
      if (!descMatch) return "";
      return descMatch[1];
    }
  }
};

module.exports = { LoadCommand, getDesc };
