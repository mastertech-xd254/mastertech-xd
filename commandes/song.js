const { zokou } = require("../framework/zokou");
const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');

zokou({
  nomCom: "song",
  categorie: "Search",
  reaction: "🎶"
}, async (origineMessage, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;

  if (!arg[0]) {
    repondre("Please specify a song name!\nExample: .song Hozambe by Beltah ft Shifura");
    return;
  }

  try {
    const searchQuery = arg.join(" ");
    const search = await yts(searchQuery);
    const videos = search.videos;

    if (!videos || videos.length === 0) {
      repondre("No songs found for your search.");
      return;
    }

    const video = videos[0];
    const videoUrl = video.url;

    // Send song info as message
    const infoMess = {
      image: { url: video.thumbnail },
      caption: `🎵 *𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗 Music Player*\n\n` +
               `*Title:* ${video.title}\n` +
               `*Duration:* ${video.timestamp}\n` +
               `*URL:* ${video.url}\n\n` +
               `_*© 𝗠𝗔𝗦𝗧𝗘𝗥𝗣𝗘𝗔𝗖𝗘 𝗘𝗟𝗜𝗧𝗘*_`
    };
    
    await zk.sendMessage(origineMessage, infoMess, { quoted: ms });

    // Download and send audio
    const audioStream = ytdl(videoUrl, { 
      filter: 'audioonly',
      quality: 'highestaudio' 
    });

    const filename = `mastertech-${Date.now()}.mp3`;
    const fileStream = fs.createWriteStream(filename);

    audioStream.pipe(fileStream);

    fileStream.on('finish', async () => {
      try {
        await zk.sendMessage(
          origineMessage, 
          { 
            audio: { url: filename },
            mimetype: 'audio/mp4',
            fileName: `${video.title}.mp3`
          }, 
          { quoted: ms, ptt: false }
        );
        fs.unlinkSync(filename); // Clean up file
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        repondre('Error sending audio file.');
      }
    });

    fileStream.on('error', (error) => {
      console.error('File write error:', error);
      repondre('Error processing audio file.');
    });

  } catch (error) {
    console.error('Command error:', error);
    repondre('An error occurred while processing your request.');
  }
});
