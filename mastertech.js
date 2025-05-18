"use strict";
const {
  Boom,
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  getContentType,
  delay,
  downloadContentFromMessage,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const FileType = require("file-type");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const cron = require("node-cron");

// Configs & Databases
const conf = require("./set");
const evt = require("./framework/zokou");
const {
  verifierEtatJid,
  recupererActionJid,
} = require("./bdd/antilien");
const {
  atbverifierEtatJid,
  atbrecupererActionJid,
} = require("./bdd/antibot");
const {
  isUserBanned,
  addUserToBanList,
  removeUserFromBanList,
} = require("./bdd/banUser");
const {
  isGroupBanned,
  addGroupToBanList,
  removeGroupFromBanList,
} = require("./bdd/banGroup");
const {
  isGroupOnlyAdmin,
  addGroupToOnlyAdminList,
  removeGroupFromOnlyAdminList,
} = require("./bdd/onlyAdmin");
const { getAllSudoNumbers } = require("./bdd/sudo");
const { recupevents } = require("./bdd/welcome");
const { getCron } = require("./bdd/cron");
const { getWarnCountByJID, ajouterUtilisateurAvecWarnCount } = require("./bdd/warn");

// Logger
const logger = pino({ level: "silent" });

// Session Auth
async function authenticateSession() {
  try {
    const sessionPath = __dirname + "/auth/creds.json";
    if (!fs.existsSync(sessionPath)) {
      console.log("🔐 Initializing MASTERTECH-MD session...");
      await fs.writeFileSync(
        sessionPath,
        atob(conf.session.replace(/MASTERTECH-MD;;;=>/g, "")),
        "utf8"
      );
    } else if (fs.existsSync(sessionPath) && conf.session !== "zokk") {
      await fs.writeFileSync(
        sessionPath,
        atob(conf.session.replace(/MASTERTECH-MD;;;=>/g, "")),
        "utf8"
      );
    }
  } catch (e) {
    console.error("❌ Invalid session: " + e);
    process.exit(1);
  }
}

authenticateSession();

// Store Setup
const store = makeInMemoryStore({ logger });
store.readFromFile("./store.json");
setInterval(() => store.writeToFile("./store.json"), 10_000);

// Main Bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");

  const sockOptions = {
    version,
    logger,
    browser: ["MASTERTECH-MD", "Chrome", "1.0.0"],
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    getMessage: async (key) => {
      return store.loadMessage(key.remoteJid, key.id) || { conversation: "Message not found" };
    },
  };

  const zk = makeWASocket(sockOptions);
  store.bind(zk.ev);

  // ====================== FEATURES ======================

  // 1. Auto-Bio (Kenya Time)
  if (conf.AUTO_BIO === "yes") {
    setInterval(async () => {
      const options = { timeZone: "Africa/Nairobi", hour12: false };
      const time = new Date().toLocaleString("en-KE", options);
      await zk.updateProfileStatus(`🤖 MASTERTECH-MD | Online (${time})`);
    }, 60_000);
  }

  // 2. Anti-Call
  zk.ev.on("call", async (call) => {
    if (conf.ANTICALL === "yes") {
      await zk.rejectCall(call[0].id, call[0].from);
      await zk.sendMessage(call[0].from, {
        text: "📵 Calls blocked. Message only.\n> MASTERTECH-MD",
      });
    }
  });

  // 3. Auto-Read Messages
  if (conf.AUTO_READ_MESSAGES === "yes") {
    zk.ev.on("messages.upsert", async ({ messages }) => {
      for (const msg of messages) {
        if (!msg.key.fromMe) await zk.readMessages([msg.key]);
      }
    });
  }

  // 4. Anti-Delete (Forward deleted messages)
  zk.ev.on("messages.upsert", async ({ messages }) => {
    if (conf.ANTIDELETEDM === "yes") {
      const ms = messages[0];
      if (ms.message?.protocolMessage?.type === 0) {
        const deletedMsg = await store.loadMessage(
          ms.message.protocolMessage.key.remoteJid,
          ms.message.protocolMessage.key.id
        );
        if (deletedMsg) {
          await zk.sendMessage(
            zk.user.id,
            {
              text: `⚠️ Deleted message from @${ms.key.participant.split("@")[0]}`,
              mentions: [ms.key.participant],
            },
            { quoted: deletedMsg }
          );
        }
      }
    }
  });

  // 5. Group Link Protection
  zk.ev.on("messages.upsert", async ({ messages }) => {
    if (conf.ANTILINK === "yes") {
      const ms = messages[0];
      const texte = ms.message?.conversation || ms.message?.extendedTextMessage?.text;
      if (texte && texte.includes("chat.whatsapp.com") && ms.key.remoteJid.endsWith("@g.us")) {
        await zk.sendMessage(ms.key.remoteJid, {
          delete: ms.key,
        });
        await zk.groupParticipantsUpdate(ms.key.remoteJid, [ms.key.participant], "remove");
      }
    }
  });

  // 6. Command Handler
  zk.ev.on("messages.upsert", async ({ messages }) => {
    const ms = messages[0];
    if (!ms.message) return;

    const mtype = getContentType(ms.message);
    const texte = mtype === "conversation" ? ms.message.conversation : 
                 mtype === "extendedTextMessage" ? ms.message.extendedTextMessage.text : "";

    if (texte && texte.startsWith(conf.PREFIXE)) {
      const cmd = texte.slice(1).split(" ")[0].toLowerCase();
      const args = texte.split(" ").slice(1);
      const command = evt.cm.find((c) => c.nomCom === cmd);

      if (command) {
        try {
          await command.fonction(
            ms.key.remoteJid,
            zk,
            {
              args,
              sender: ms.key.participant || ms.key.remoteJid,
              pushName: ms.pushName,
              isGroup: ms.key.remoteJid.endsWith("@g.us"),
              reply: (text) => zk.sendMessage(ms.key.remoteJid, { text }, { quoted: ms }),
            }
          );
        } catch (e) {
          console.error("Command error:", e);
        }
      }
    }
  });

  // 7. Welcome/Goodbye Messages
  zk.ev.on("group-participants.update", async (update) => {
    const metadata = await zk.groupMetadata(update.id);
    if (update.action === "add" && (await recupevents(update.id, "welcome") === "on")) {
      await zk.sendMessage(update.id, {
        text: `👋 Welcome @${update.participants[0].split("@")[0]} to ${metadata.subject}!`,
        mentions: update.participants,
      });
    } else if (update.action === "remove" && (await recupevents(update.id, "goodbye") === "on")) {
      await zk.sendMessage(update.id, {
        text: `🚪 @${update.participants[0].split("@")[0]} left the group.`,
        mentions: update.participants,
      });
    }
  });

  // 8. Auto-Reply (PM)
  if (conf.AUTO_REPLY === "yes") {
    zk.ev.on("messages.upsert", async ({ messages }) => {
      const ms = messages[0];
      if (!ms.key.fromMe && !ms.key.remoteJid.endsWith("@g.us")) {
        await zk.sendMessage(ms.key.remoteJid, {
          text: conf.AUTO_REPLY_MSG || "I’m busy. Reply later.",
        });
      }
    });
  }

  // ====================== UTILITIES ======================
  // Media Downloader
  zk.downloadAndSaveMediaMessage = async (message, filename = "") => {
    const stream = await downloadContentFromMessage(message, "file");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    const type = await FileType.fromBuffer(buffer);
    const filePath = `./${filename}.${type.ext}`;
    await fs.writeFileSync(filePath, buffer);
    return filePath;
  };

  // Sticker Creator
  zk.createSticker = async (imageBuffer, options = {}) => {
    const sticker = new Sticker(imageBuffer, {
      pack: options.pack || "MASTERTECH-MD",
      type: StickerTypes.FULL,
      quality: 50,
    });
    return await sticker.toBuffer();
  };

  // ====================== START BOT ======================
  zk.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ MASTERTECH-MD is ONLINE!");
      if (conf.DP === "yes") {
        zk.sendMessage(zk.user.id, {
          text: `*🤖 MASTERTECH-MD Activated!*\n\n- Prefix: ${conf.PREFIXE}\n- Owner: ${conf.NUMERO_OWNER}\n- Mode: ${conf.MODE}`,
        });
      }
    } else if (connection === "close") {
      console.log("⚠️ Reconnecting...");
      startBot(); // Auto-reconnect
    }
  });

  zk.ev.on("creds.update", saveCreds);
}

startBot().catch(console.error);
