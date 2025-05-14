const { zokou } = require("../framework/zokou");
const canvacord = require("canvacord");
const { uploadImageToImgur } = require("../framework/imgur");

// Generic function to create a canvacord order
function createCanvacordCommand(commandName, canvacordFunction) {
  zokou({
    nomCom: commandName,
    categorie: "Image-Edit",
    reaction: "🎉",
  }, async (origineMessage, zk, commandeOptions) => {
    const { ms, msgRepondu, auteurMsgRepondu } = commandeOptions;
    const clientId = 'b40a1820d63cd4e';  // Client ID for Imgur

    try {
      let img;

      // Check if a reply with an image was received
      if (msgRepondu) {
        if (msgRepondu.imageMessage) {
          // Download and upload the image to Imgur
          const image = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
          img = await uploadImageToImgur(image, clientId);
        } else {
          // If the replied message is a user, fetch the profile picture
          img = await zk.profilePictureUrl(auteurMsgRepondu, 'image');
        }
      } else {
        // If no reply, use a default fallback image
        img = "https://i.pinimg.com/564x/84/09/12/840912dd744e6662ab211b8070b5d84c.jpg";
      }

      // Apply the canvacord effect
      const result = await canvacordFunction(img);

      // Send back the image with the effect applied
      await zk.sendMessage(origineMessage, { image: result }, { quoted: ms });
    } catch (error) {
      console.error(`Error when processing the "${commandName}" command:`, error);
      await zk.sendMessage(origineMessage, "An error occurred while processing your request. Please try again later.");
    }
  });
}

// Create commands with different canvacord effects
const effects = [
  "shit", "wasted", "wanted", "trigger", "trash", "rip", "sepia", 
  "rainbow", "hitler", "invert", "jail", "affect", "beautiful", 
  "blur", "circle", "facepalm", "greyscale", "joke"
];

// Dynamically create commands for all effects
effects.forEach(effect => {
  createCanvacordCommand(effect, canvacord.Canvacord[effect]);
});
