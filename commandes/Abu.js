const util = require('util');
const fs = require('fs');
const axios = require('axios');
const { zokou } = require('../framework/zokou');
const { format } = require('../framework/mesfonctions');
const os = require('os');
const moment = require('moment-timezone');

const styles = {
  0xa: {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
    'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ϙ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
    'u': 'ᴜ', 'v': 'v', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ', 'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ',
    'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ',
    'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ϙ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'v', 'W': 'ᴡ', 'X': 'x',
    'Y': 'ʏ', 'Z': 'ᴢ'
  }
};

function applyStyle(text, style) {
  const styleMap = styles[style];
  return text.split('').map(char => styleMap[char] || char).join('');
}

function runtime(ms) {
  ms = Number(ms);
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm ' : ''}${seconds}s`;
}

async function fetchGitHubStats() {
  try {
    const repoName = 'https://github.com/mastertech-md/Mastertech'; // Change to your repo
    const response = await axios.get(`https://api.github.com/repos/${repoName}`);
    const stars = response.data.stargazers_count;
    const forks = response.data.forks_count;
    return { stars, forks, totalUsers: stars * 2 + forks * 2 };
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return { stars: 0, forks: 0, totalUsers: 0 };
  }
}

zokou({ nomCom: 'Bot Name', categorie: 'General' }, async (message, bot, params) => {
  const { ms, repondre, prefixe, nomAuteurMessage } = params;

  let greeting = 'Good Morning';
  const currentHour = moment().hour();
  if (currentHour >= 12 && currentHour <= 16) {
    greeting = 'Good Afternoon';
  } else if (currentHour >= 16 && currentHour <= 18) {
    greeting = 'Good Evening';
  } else if (currentHour >= 18 && currentHour <= 23) {
    greeting = 'Good Night';
  }

  const { totalUsers } = await fetchGitHubStats();
  const formattedMem = format(os.totalmem() - os.freemem()) + '/' + format(os.totalmem());
  const botUptime = runtime(process.uptime() * 1000);

  let menuMessage = `
  *${greeting} ${nomAuteurMessage}*
  ┊✺│ *Prefix*: ${prefixe}
  ┊✺│ *Time*: ${moment().format('HH:mm:ss')}
  ┊✺│ *Date*: ${moment().format('DD/MM/YYYY')}
  ┊✺│ *Uptime*: ${botUptime}
  ┊✺│ *Total Users*: ${totalUsers}
  ┊✺│ *Memory*: ${formattedMem}
  ┊✺│ *GitHub Stats*: ${totalUsers} users, ${totalUsers} total interactions
  ┊✺└────••••────⊷
  `;

  const usersList = Object.keys(bot.users);
  usersList.forEach((user, index) => {
    menuMessage += `${applyStyle(user, 0xa)} - ${index + 1}\n`;
  });

  try {
    await bot.sendMessage(message, {
      text: menuMessage,
      contextInfo: {
        mentionedJid: [nomAuteurMessage],
        externalAdReply: {
          title: 'Bot Menu',
          body: 'Your bot menu is here!',
          thumbnailUrl: 'https://example.com/thumbnail.jpg', // Add a thumbnail URL if needed
          sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    repondre('Error: ' + error);
  }
});
