const axios = require('axios');
const { zokou } = require("../framework/zokou");
const fs = require("fs-extra");
const { exec } = require("child_process");
const { unlink } = require('fs').promises;
const logger = console; // Replace with your logger if available

// Utility function to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Converts GIF buffer to MP4 video buffer with robust error handling
 */
const GIFBufferToVideoBuffer = async (gifBuffer) => {
    const tempName = `temp_${Math.random().toString(36).slice(2, 9)}`;
    const gifPath = `./${tempName}.gif`;
    const mp4Path = `./${tempName}.mp4`;

    try {
        // Write GIF to temporary file
        await fs.writeFile(gifPath, gifBuffer);

        // Convert using FFmpeg with error handling
        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -i ${gifPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${mp4Path}`,
                (error, stdout, stderr) => {
                    if (error) {
                        logger.error(`FFmpeg Error: ${stderr || error.message}`);
                        reject(new Error('Failed to convert GIF to video'));
                    } else {
                        resolve();
                    }
                }
            );
        });

        // Verify conversion with timeout
        let attempts = 0;
        while (!fs.existsSync(mp4Path) && attempts < 10) {
            await sleep(500);
            attempts++;
        }

        if (!fs.existsSync(mp4Path)) {
            throw new Error('Video conversion failed - no output file');
        }

        return await fs.readFile(mp4Path);
    } finally {
        // Cleanup temporary files
        await Promise.allSettled([
            unlink(gifPath).catch(e => logger.error('GIF cleanup failed:', e)),
            unlink(mp4Path).catch(e => logger.error('MP4 cleanup failed:', e))
        ]);
    }
};

/**
 * Generates a complete reaction command with all safety checks
 */
const generateReactionCommand = (reactionName, reactionEmoji) => {
    zokou({
        nomCom: reactionName,
        categorie: "Reaction",
        reaction: reactionEmoji,
    },
    async (origineMessage, zk, commandeOptions) => {
        const { auteurMessage, auteurMsgRepondu, repondre, ms, msgRepondu } = commandeOptions;

        try {
            // 1. Fetch GIF URL from API
            const apiResponse = await axios.get(`https://api.waifu.pics/sfw/${reactionName}`, {
                timeout: 10000,
                validateStatus: status => status === 200
            });

            if (!apiResponse.data?.url) {
                throw new Error('Invalid API response');
            }

            // 2. Download GIF with timeout
            const gifResponse = await axios.get(apiResponse.data.url, {
                responseType: 'arraybuffer',
                timeout: 15000,
                maxContentLength: 10 * 1024 * 1024 // 10MB limit
            });

            // 3. Convert to video
            const videoBuffer = await GIFBufferToVideoBuffer(gifResponse.data);

            // 4. Prepare message parameters
            const mentionText = msgRepondu
                ? `@${auteurMessage.split("@")[0]} ${reactionName}s @${auteurMsgRepondu.split("@")[0]}`
                : `@${auteurMessage.split("@")[0]} ${reactionName}s everyone`;

            const messageOptions = {
                video: videoBuffer,
                gifPlayback: true,
                caption: mentionText,
                mentions: msgRepondu 
                    ? [auteurMessage, auteurMsgRepondu] 
                    : [auteurMessage]
            };

            // 5. Send the message
            await zk.sendMessage(origineMessage, messageOptions, { quoted: ms });

        } catch (error) {
            logger.error(`[${reactionName} Command Error]:`, error);
            const errorMessage = error.response?.status === 404
                ? `The ${reactionName} reaction is currently unavailable.`
                : `Failed to process ${reactionName}. Please try again later.`;
            
            repondre(errorMessage);
        }
    });
};

// ======================
// COMPLETE REACTION LIST
// ======================
generateReactionCommand("bully", "👊");
generateReactionCommand("cuddle", "🤗");
generateReactionCommand("cry", "😢");
generateReactionCommand("hug", "😊");
generateReactionCommand("awoo", "🐺");
generateReactionCommand("kiss", "😘");
generateReactionCommand("lick", "👅");
generateReactionCommand("pat", "👋");
generateReactionCommand("smug", "😏");
generateReactionCommand("bonk", "🔨");
generateReactionCommand("yeet", "🚀");
generateReactionCommand("blush", "😊");
generateReactionCommand("smile", "😄");
generateReactionCommand("wave", "👋");
generateReactionCommand("highfive", "✋");
generateReactionCommand("handhold", "🤝");
generateReactionCommand("nom", "👅");
generateReactionCommand("bite", "🦷");
generateReactionCommand("glomp", "🤗");
generateReactionCommand("slap", "👋");
generateReactionCommand("kill", "💀");
generateReactionCommand("kick", "🦵");
generateReactionCommand("happy", "😄");
generateReactionCommand("wink", "😉");
generateReactionCommand("poke", "👉");
generateReactionCommand("dance", "💃");
generateReactionCommand("cringe", "😬");
generateReactionCommand("poke", "👉");
generateReactionCommand("dance", "💃");
generateReactionCommand("cringe", "😬");
generateReactionCommand("wink", "😉");
generateReactionCommand("happy", "😄");
generateReactionCommand("kick", "🦵");
generateReactionCommand("kill", "💀");
generateReactionCommand("slap", "👋");
generateReactionCommand("glomp", "🤗");
generateReactionCommand("bite", "🦷");
generateReactionCommand("nom", "👅");
generateReactionCommand("handhold", "🤝");
generateReactionCommand("highfive", "✋");
generateReactionCommand("wave", "👋");
generateReactionCommand("smile", "😄");
generateReactionCommand("blush", "😊");
generateReactionCommand("yeet", "🚀");
generateReactionCommand("bonk", "🔨");
generateReactionCommand("smug", "😏");
generateReactionCommand("pat", "👋");
generateReactionCommand("lick", "👅");
generateReactionCommand("kiss", "😘");
generateReactionCommand("awoo", "🐺");
generateReactionCommand("hug", "😊");
generateReactionCommand("cry", "😢");
generateReactionCommand("cuddle", "🤗");
generateReactionCommand("bully", "👊");
