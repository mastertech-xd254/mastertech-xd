"use strict";
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore, jidDecode, getContentType, delay, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const FileType = require("file-type");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

// Import configurations and utilities
const conf = require("./set");
const evt = require("./framework/zokou");
const { verifierEtatJid, recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid, atbrecupererActionJid } = require("./bdd/antibot");
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
const { isGroupBanned, addGroupToBanList, removeGroupFromBanList } = require("./bdd/banGroup");
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require("./bdd/onlyAdmin");
const { getAllSudoNumbers } = require("./bdd/sudo");
const { recupevents } = require("./bdd/welcome");
const { getCron } = require("./bdd/cron");

// Initialize logger
const logger = pino({ level: "silent" });

// Session authentication
async function authenticateSession() {
    try {
        const sessionPath = __dirname + "/auth/creds.json";
        if (!fs.existsSync(sessionPath)) {
            console.log("🔐 Initializing MASTERTECH-MD session...");
            await fs.writeFileSync(sessionPath, atob(conf.session.replace(/MASTERTECH-MD;;;=>/g, "")), "utf8");
        } else if (fs.existsSync(sessionPath) && conf.session !== "zokk") {
            await fs.writeFileSync(sessionPath, atob(conf.session.replace(/MASTERTECH-MD;;;=>/g, "")), "utf8");
        }
    } catch (e) {
        console.error("❌ Invalid session: " + e);
        process.exit(1);
    }
}

authenticateSession();

// Store setup
const store = makeInMemoryStore({ logger });
store.readFromFile("./store.json");
setInterval(() => store.writeToFile("./store.json"), 10_000);

// Main bot function
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

    // Auto-bio update (Kenya time)
    if (conf.AUTO_BIO === "yes") {
        setInterval(async () => {
            const options = { timeZone: "Africa/Nairobi", hour12: false };
            const time = new Date().toLocaleString("en-KE", options);
            await zk.updateProfileStatus(`🤖 MASTERTECH-MD is online | ${time}`);
        }, 60_000);
    }

    // Anti-call feature
    zk.ev.on("call", async (call) => {
        if (conf.ANTICALL === "yes") {
            await zk.rejectCall(call[0].id, call[0].from);
            await zk.sendMessage(call[0].from, { 
                text: "📵 Calls are blocked. Please message instead.\n\n> Powered by MASTERTECH-MD" 
            });
        }
    });

    // Auto-read messages
    if (conf.AUTO_READ_MESSAGES === "yes") {
        zk.ev.on("messages.upsert", async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.key.fromMe) await zk.readMessages([msg.key]);
            }
        });
    }

    // Command handler
    zk.ev.on("messages.upsert", async ({ messages }) => {
        const ms = messages[0];
        if (!ms.message) return;

        const mtype = getContentType(ms.message);
        const texte = mtype === "conversation" ? ms.message.conversation : 
                     mtype === "extendedTextMessage" ? ms.message.extendedTextMessage.text : "";

        const remoteJid = ms.key.remoteJid;
        const isGroup = remoteJid.endsWith("@g.us");
        const sender = ms.key.participant || remoteJid;
        const pushName = ms.pushName;

        // Process commands
        if (texte && texte.startsWith(conf.PREFIXE)) {
            const cmd = texte.slice(1).split(" ")[0].toLowerCase();
            const args = texte.split(" ").slice(1);
            
            const command = evt.cm.find((c) => c.nomCom === cmd);
            if (command) {
                try {
                    await command.fonction(remoteJid, zk, { 
                        args, 
                        sender, 
                        pushName, 
                        isGroup, 
                        reply: (text) => zk.sendMessage(remoteJid, { text }, { quoted: ms }) 
                    });
                } catch (e) {
                    console.error("Command error:", e);
                }
            }
        }
    });

    // Group event handlers (welcome, goodbye, etc.)
    zk.ev.on("group-participants.update", async (update) => {
        if (update.action === "add" && (await recupevents(update.id, "welcome") === "on")) {
            await zk.sendMessage(update.id, { 
                text: `👋 Welcome @${update.participants[0].split("@")[0]} to the group!`, 
                mentions: update.participants 
            });
        }
    });

    // Connection handling
    zk.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            console.log("✅ MASTERTECH-MD is online!");
            if (conf.DP === "yes") {
                zk.sendMessage(zk.user.id, { 
                    text: `*MASTERTECH-MD Activated!*\n\nPrefix: ${conf.PREFIXE}\nMode: ${conf.MODE}\nOwner: ${conf.NUMERO_OWNER}` 
                });
            }
        } else if (connection === "close") {
            console.log("⚠️ Connection lost. Reconnecting...");
            startBot(); // Auto-reconnect
        }
    });

    // Save credentials
    zk.ev.on("creds.update", saveCreds);

    return zk;
}

// Start the bot
startBot().catch(console.error);
