const { zokou } = require("../framework/zokou");
const { getAllSudoNumbers, isSudoTableNotEmpty } = require("../bdd/sudo");
const conf = require("../set");

// Owner command to display owner and sudo users.
zokou({ nomCom: "owner", categorie: "General", reaction: "❣️" }, async (dest, zk, commandeOptions) => {
  const { ms, mybotpic } = commandeOptions;

  const thsudo = await isSudoTableNotEmpty();

  if (thsudo) {
    let msg = `*My Super-User*\n*Owner Number*\n: \n- 🌟 @${conf.NUMERO_OWNER}\n\n------ *other sudos* -----\n`;

    // Fetch all sudo numbers and build the message.
    let sudos = await getAllSudoNumbers();
    for (const sudo of sudos) {
      if (sudo) { // Validate the sudo number
        const sudonumero = sudo.replace(/[^0-9]/g, ''); // Clean the number
        msg += `- 💼 @${sudonumero}\n`;
      }
    }

    // Build the list of mentioned JIDs (including owner).
    const ownerjid = conf.NUMERO_OWNER.replace(/[^0-9]/g) + "@s.whatsapp.net";
    const mentionedJid = [...sudos, ownerjid];

    // Send the message with the image and mentions.
    zk.sendMessage(dest, {
      image: { url: mybotpic() },
      caption: msg,
      mentions: mentionedJid,
    });
  } else {
    // If no sudo table exists, send the owner's contact as vCard.
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + conf.OWNER_NAME + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + conf.NUMERO_OWNER + ':+' + conf.NUMERO_OWNER + '\n' +
      'END:VCARD';

    zk.sendMessage(dest, {
      contacts: {
        displayName: conf.OWNER_NAME,
        contacts: [{ vcard }],
      },
    }, { quoted: ms });
  }
});

// Developer command to list developers and their contact links.
zokou({ nomCom: "dev", categorie: "General", reaction: "💘" }, async (dest, zk, commandeOptions) => {
  const { ms, mybotpic } = commandeOptions;

  const devs = [
    { nom: "MASTERPEACE", numero: "254743727510" },
    { nom: "᚛MASTERPEACE᚜", numero: "254743727510" },
    { nom: "MASTERPEACE", numero: "254743727510" },
    // Add more developers here
  ];

  let message = "WELCOME TO MASTERTECH-MD HELP CENTER! ASK FOR HELP FROM ANY OF THE DEVELOPERS BELOW:\n\n";
  for (const dev of devs) {
    message += `----------------\n• ${dev.nom} : https://wa.me/${dev.numero}\n`;
  }

  const lien = mybotpic();
  if (lien.match(/\.(mp4|gif)$/i)) {
    try {
      zk.sendMessage(dest, { video: { url: lien }, caption: message }, { quoted: ms });
    } catch (e) {
      console.log("🥵🥵 Menu error " + e);
    }
  } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
    try {
      zk.sendMessage(dest, { image: { url: lien }, caption: message }, { quoted: ms });
    } catch (e) {
      console.log("🥵🥵 Menu error " + e);
    }
  } else {
    repondre("link error");
  }
});

// Support command to send support-related links.
zokou({ nomCom: "support", categorie: "General" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre, auteurMessage } = commandeOptions;

  repondre("THANK YOU FOR CHOOSING MASTERTECH-MD, HERE ARE OUR SUPPORTIVE LINKS\n\n ☉ CHANNEL LINK IS HERE ☉ \n\n❒⁠⁠⁠⁠[https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D] \n\n ☉ GROUP LINK IS HERE ☉\n\n❒⁠⁠⁠⁠[https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D] \n\n ☉YOUTUBE LINK IS HERE ☉\n\n❒⁠⁠⁠⁠[\n\n\n*Created By MASTERPEACE ELITE");

  await zk.sendMessage(auteurMessage, { text: `THANK YOU FOR CHOOSING MASTERTECH-MD, MAKE SURE YOU FOLLOW THESE LINKS.` }, { quoted: ms });
});
