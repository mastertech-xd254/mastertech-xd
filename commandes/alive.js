const { zokou } = require('../framework/zokou');
const { addOrUpdateDataInAlive, getDataFromAlive } = require('../bdd/alive');
const moment = require('moment-timezone');
const s = require(__dirname + '/../set');

zokou({
  nomCom: 'alive',
  categorie: 'General',
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, superUser } = commandeOptions;

  // Fetch the stored "alive" message data
  const data = await getDataFromAlive();

  // If no argument is provided, display the current "alive" status
  if (!arg || !arg[0] || arg.join('') === '') {
    if (data) {
      const { message, lien } = data;

      const mode = (s.MODE.toLowerCase() !== 'yes') ? 'private' : 'public';

      // Set default time zone to GMT
      moment.tz.setDefault('Etc/GMT');

      // Get current time and date in GMT
      const temps = moment().format('HH:mm:ss');
      const date = moment().format('DD/MM/YYYY');

      const alivemsg = `
*Owner* : ${s.OWNER_NAME}
*Mode* : ${mode}
*Date* : ${date}
*Hours (GMT)* : ${temps}

${message}

*MASTERTECH-MD-WABOT*`;

      // Send the appropriate media (video, image, or text)
      try {
        if (lien.match(/\.(mp4|gif)$/i)) {
          await zk.sendMessage(dest, { video: { url: lien }, caption: alivemsg }, { quoted: ms });
        } else if (lien.match(/\.(jpeg|png|jpg)$/i)) {
          await zk.sendMessage(dest, { image: { url: lien }, caption: alivemsg }, { quoted: ms });
        } else {
          repondre(alivemsg);
        }
      } catch (e) {
        console.error("🥵🥵 Error sending media: ", e);
        repondre("🥵🥵 Menu error: " + e);
      }
    } else {
      if (!superUser) {
        repondre("USKUE FALA BANA🙆😒😂");
        return;
      }

      await repondre("TANGU LINI A LEGIT 🕷️MASTERTECH-MD🕷️ IKAZIMA,, DON'T BE A FOOL");
      repondre("YOO DON'T DISTURB ME 🤦AM ALWAYS ACTIVE :)");
    }
  } else {
    // If arguments are provided, only the super user can modify the alive message
    if (!superUser) {
      repondre("Only the owner can modify the alive message.");
      return;
    }

    // Extract the message and link from the arguments
    const [texte, tlien] = arg.join(' ').split(';');

    // Update the stored data
    await addOrUpdateDataInAlive(texte, tlien);

    repondre('Holla🥴, *MASTERTECH-MD BOT* is alive just like you gee.');
  }
});
