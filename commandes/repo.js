const util = require('util');
const fs = require('fs-extra');
const { zokou } = require(__dirname + "/../framework/zokou");
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)

zokou({ nomCom: "repo", categorie: "General" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre ,prefixe,nomAuteurMessage,mybotpic} = commandeOptions;
    let { cm } = require(__dirname + "/../framework//zokou");
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    cm.map(async (com, index) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('Etc/GMT');

    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    let infoMsg =  `
      *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗 𝐈𝐍𝐅𝐎* 
❒───────────────────❒
*GITHUB LINK*
> https://github.com/mastertech-md/Mastertech-

*𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗 𝐂𝐇𝐀𝐍𝐍𝐄𝐋*
> https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D
⁠
╭───────────────────❒
│👌 *RAM* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
│🔥 *DEV1* : *MASTERPEACE*
│🕷️ *DEV2* : *MASTERPEACE*
⁠⁠⁠⁠╰───────────────────❒
  `;
    
    let menuMsg = `
     *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗*

❒────────────────────❒`;

    var lien = mybotpic();

    if (lien.match(/\.(mp4|gif)$/i)) {
        try {
            zk.sendMessage(dest, { video: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗*, déveloper MASTERPEACE ELITE" , gifPlayback : true }, { quoted: ms });
        }
        catch (e) {
            console.log("🥵🥵 Menu erreur " + e);
            repondre("🥵🥵 Menu erreur " + e);
        }
    } 
    else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
        try {
            zk.sendMessage(dest, { image: { url: lien }, caption:infoMsg + menuMsg, footer: "Je suis *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗*, déveloper MASTERPEACE ELITE" }, { quoted: ms });
        }
        catch (e) {
            console.log("🥵🥵 Menu erreur " + e);
            repondre("🥵🥵 Menu erreur " + e);
        }
    } 
    else {
        repondre(infoMsg + menuMsg);
    }
});
