require("module-alias/register");
const {
  makeWASocket: makeWASocket,
  delay,
  useMultiFileAuthState,
  makeInMemoryStore,
  jidNormalizedUser,
  DisconnectReason,
  Browsers,
  makeCacheableSignalKeyStore,
} = require("@seaavey/baileys");
const { Client, serialize } = require("@/utils/serialize");
const { Boom } = require("@hapi/boom");

const pino = require("pino");
const uuid = require("uuid");
const fs = require("fs");

if (!fs.existsSync("config.svy")) {
  const ID = uuid.v4();
  fs.writeFileSync(
    "config.svy",
    JSON.stringify({
      ID,
      render: "multidevice",
      V: "SYV-A0324F55-DD88-4E5A-8DD7-516CC1CDA6E3",
      B: Buffer.from(ID).toString("base64"),
    })
  );
  console.log("[+] Config SVY Created");
}

const { usePairingCode, Number } = JSON.parse(fs.readFileSync("config.json"));

const logger = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`,
}).child({ class: "seaavey" });
logger.level = "fatal";

const store = makeInMemoryStore({ logger });

const waSocket = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const conn = makeWASocket({
    version: [2, 3000, 1015901307],
    logger,
    printQRInTerminal: !usePairingCode,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.windows("firefox"),
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    syncFullHistory: true,
    retryRequestDelayMs: 10,
    transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 10 },
    defaultQueryTimeoutMs: undefined,
    maxMsgRetryCount: 15,
    appStateMacVerification: {
      patch: true,
      snapshot: true,
    },
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid);
      const msg = await store.loadMessage(jid, key.id);

      return msg?.message || "";
    },
    shouldSyncHistoryMessage: (msg) => {
      console.log(`\x1b[32mMemuat Chat [${msg.progress}%]\x1b[39m`);
      return !!msg.syncType;
    },
  });

  store.bind(conn.ev);

  await Client({ conn, store });

  if (usePairingCode && !conn.authState.creds.registered) {
    let phoneNumber = Number.replace(/[^0-9]/g, "");
    await delay(3000);
    let code = await conn.requestPairingCode(phoneNumber);
    console.log(`\x1b[32m${code?.match(/.{1,4}/g)?.join("-") || code}\x1b[39m`);
  }

  conn.ev.on("connection.update", async (update) => {
    const { lastDisconnect, connection } = update;
    if (connection) {
      console.info(`Connection Status : ${connection}`);
    }

    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

      switch (reason) {
        case DisconnectReason.multideviceMismatch:
        case DisconnectReason.loggedOut:
        case 403:
          console.error(lastDisconnect.error?.message);
          await conn.logout();
          break;
        default:
          console.error(lastDisconnect.error?.message);
          await waSocket();
      }
    }

    if (connection === "open") {
      console.info("Connection Opened");
    }
  });

  conn.ev.on("creds.update", saveCreds);

  conn.ev.on("contacts.update", (update) => {
    for (let contact of update) {
      let id = jidNormalizedUser(contact.id);
      if (store && store.contacts)
        store.contacts[id] = {
          ...(store.contacts?.[id] || {}),
          ...(contact || {}),
        };
    }
  });

  conn.ev.on("contacts.upsert", (update) => {
    for (let contact of update) {
      let id = jidNormalizedUser(contact.id);
      if (store && store.contacts)
        store.contacts[id] = { ...(contact || {}), isContact: true };
    }
  });

  conn.ev.on("groups.update", (updates) => {
    for (const update of updates) {
      const id = update.id;
      if (store.groupMetadata[id]) {
        store.groupMetadata[id] = {
          ...(store.groupMetadata[id] || {}),
          ...(update || {}),
        };
      }
    }
  });

  conn.ev.on("group-participants.update", ({ id, participants, action }) => {
    const metadata = store.groupMetadata[id];
    if (metadata) {
      switch (action) {
        case "add":
        case "revoked_membership_requests":
          metadata.participants.push(
            ...participants.map((id) => ({
              id: jidNormalizedUser(id),
              admin: null,
            }))
          );
          break;
        case "demote":
        case "promote":
          for (const participant of metadata.participants) {
            let id = jidNormalizedUser(participant.id);
            if (participants.includes(id)) {
              participant.admin = action === "promote" ? "admin" : null;
            }
          }
          break;
        case "remove":
          metadata.participants = metadata.participants.filter(
            (p) => !participants.includes(jidNormalizedUser(p.id))
          );
          break;
      }
    }
  });

  conn.ev.on("messages.upsert", async ({ messages }) => {
    if (!messages[0].message) return;

    let m = await serialize(conn, messages[0], store);

    if (m.key && !m.key.fromMe && m.key.remoteJid === "status@broadcast") {
      if (m.type === "protocolMessage" && m.message.protocolMessage.type === 0)
        return;
      await conn.readMessages([m.key]);
    }

    const handler = await require(`./handler.js`);
    handler(conn, m, store);
  });

  process.on("uncaughtException", console.error);
  process.on("unhandledRejection", console.error);
};

waSocket();
