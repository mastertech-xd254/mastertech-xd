const fs = require('fs-extra');
const path = require('path');
const { Sequelize } = require('sequelize');

// Load environment variables
if (fs.existsSync('set.env')) require('dotenv').config({ path: path.join(__dirname, 'set.env') });

// Database configuration
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined ? databasePath : process.env.DATABASE_URL;

module.exports = {
    // Core settings
    session: process.env.SESSION_ID || 'mastertech-md;;;',
    PREFIXE: process.env.PREFIX || "+",
    OWNER_NAME: process.env.OWNER_NAME || "Masterpeace Elite",
    NUMERO_OWNER: process.env.NUMERO_OWNER || "254743727510",
    
    // Feature toggles
    CHAT_BOT: process.env.CHAT_BOT || "non",
    ANTICALL: process.env.ANTICALL || "non",
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "non",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || "non",
    AUTO_BIO: process.env.AUTO_BIO || "non",
    ANTIDELETEDM: process.env.ANTIDELETEDM || "non",
    ANTIVV: process.env.ANTIVV || "non",
    ADMGROUP: process.env.ADMGROUP || "non",
    AUTO_SAVE_CONTACTS: process.env.AUTO_SAVE_CONTACTS || "non",
    AUTO_REPLY: process.env.AUTO_REPLY || "non",
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'non',
    AUTOREAD_MESSAGES: process.env.AUTOREAD_MESSAGES || "non",
    AUTO_REACT: process.env.AUTO_REACTION || "non",
    ANTILINK: process.env.ANTILINK || "non",
    PM_PERMIT: process.env.PM_PERMIT || 'no',
    CHATBOT: process.env.PM_CHATBOT || 'no',
    
    // URLs and links
    GURL: process.env.GURL || "https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D",
    WEBSITE: process.env.GURL || "https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D",
    URL: process.env.BOT_MENU_LINKS || '',
    
    // Appearance
    CAPTION: process.env.CAPTION || "ᴘᴏᴡᴇʀᴇᴅ ʙʏ mastertech-md",
    BOT: process.env.BOT_NAME || 'mastertech-md',
    DP: process.env.STARTING_BOT_MESSAGE || "yes",
    
    // Behavior
    MODE: process.env.PUBLIC_MODE || "no",
    TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",
    WARN_COUNT: process.env.WARN_COUNT || '3',
    ETAT: process.env.PRESENCE || '',
    ADM: process.env.ANTI_DELETE_MESSAGE || 'no',
    
    // Database
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9" 
        : "postgres://db_7xp9_user:6hwmTN7rGPNsjlBEHyX49CXwrG7cDeYi@dpg-cj7ldu5jeehc73b2p7g0-a.oregon-postgres.render.com/db_7xp9",
    
    // Heroku (keeping original structure)
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || null,
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY || null
};

// Config file hot reload
let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`Configuration updated: ${path.basename(__filename)}`);
    delete require.cache[fichier];
    require(fichier);
});
