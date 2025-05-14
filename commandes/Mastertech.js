'use strict';

Object.defineProperty(exports, "__esModule", {
  'value': true
});

const { zokou } = require("../framework/zokou");

zokou({
  'nomCom': "wagroup",
  'reaction': '🤨',
  'categorie': "Support-Owner",
  'nomFichier': __filename
}, async (_0x3258e7, _0x4c4732, _0x13b70c) => {
  console.log("Commande saisie !!!s");
  await _0x4c4732.sendMessage(_0x3258e7, {
    'text': "Hello 👋\n\nClick on the button below to join the OFFICIAL *ELITE-MD* WhatsApp channel",
    'contextInfo': {
      'externalAdReply': {
        'sourceUrl': "https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D",
        'mediaType': 0x1,
        'mediaUrl': "https://files.catbox.moe/7irwqn.jpeg",
        'title': "Join Our WhatsApp Group",
        'body': "Click to join the official ELITE-MD WhatsApp channel!"
      }
    }
  });
  console.log("Command executed: wagroup");
});

zokou({
  'nomCom': 'wachannel',
  'reaction': '👀',
  'categorie': "Support-Owner",
  'nomFichier': __filename
}, async (_0x14c950, _0x346e6b, _0x31cbea) => {
  console.log("Commande saisie !!!s");
  await _0x346e6b.sendMessage(_0x14c950, {
    'text': "Hello 👋\n\nClick on the button below to Follow the OFFICIAL *ELITE-MD* WhatsApp Channel",
    'contextInfo': {
      'externalAdReply': {
        'sourceUrl': 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D',
        'mediaType': 0x1,
        'mediaUrl': "https://files.catbox.moe/7irwqn.jpeg",
        'title': "Join Our WhatsApp Channel",
        'body': "Click to join the official MASTERTECH_ELITE-MD WhatsApp channel!"
      }
    }
  });
  console.log("Command executed: wachannel");
});

zokou({
  'nomCom': 'waowner',
  'reaction': '👀',
  'categorie': "Support-Owner",
  'nomFichier': __filename
}, async (_0x14c950, _0x346e6b, _0x31cbea) => {
  console.log("Commande saisie !!!s");
  await _0x346e6b.sendMessage(_0x14c950, {
    'text': "Hello 👋\n\nClick on the button below to contact the OFFICIAL *ELITE-MD* Owner",
    'contextInfo': {
      'externalAdReply': {
        'sourceUrl': 'https://wa.me/254743727510',
        'mediaType': 0x1,
        'title': "Join Our Developer Place",
        'body': "Join here to enter owners inbox"
      }
    }
  });
  console.log("Command executed: waowner");
});

zokou({
  'nomCom': 'fb-page',
  'reaction': '👀',
  'categorie': "Support-Owner",
  'nomFichier': __filename
}, async (_0x14c950, _0x346e6b, _0x31cbea) => {
  console.log("Commande saisie !!!s");
  await _0x346e6b.sendMessage(_0x14c950, {
    'text': "Hello 👋\n\nClick on the photo below to Follow the OFFICIAL *MASTERTECH* Facebook Page",
    'contextInfo': {
      'externalAdReply': {
        'sourceUrl': 'https://www.facebook.com/profile?id=61561059627340',
        'mediaType': 0x1,
        'mediaUrl': "https://files.catbox.moe/7irwqn.jpeg",
        'title': "Follow Facebook Page 📄",
        'body': "Click to join the OFFICIAL MASTERTECH Facebook Page!"
      }
    }
  });
  console.log("Command executed: fb-page");
});
