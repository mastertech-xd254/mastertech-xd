const { zokou } = require('../framework/zokou');
const axios = require('axios');
const ytSearch = require('yt-search');

zokou({
  nomCom: 'ytmusic',
  aliases: ['ytmp3', 'yt-audio', 'music'],
  categorie: 'Support-Owner',
  reaction: '🎵'
}, async (command, client, message) => {
  const { arg, ms, repondre } = message;

  if (!arg || arg.length === 0) {
    return repondre("Please provide a search query.");
  }

  const query = arg.join(' ');

  try {
    // Search YouTube for the given query
    const searchResult = await ytSearch(query);

    if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
      return repondre("No audio found for your search query.");
    }

    // Get the first video result
    const video = searchResult.videos[0];
    const audioUrl = video.url;

    // Fetch the audio file from the URL
    const audioData = await axios.get(audioUrl, { responseType: 'arraybuffer' });

    // Prepare the response with the audio file and media info
    const audioMessage = {
      audio: {
        url: audioUrl
      },
      mimetype: 'audio/mp3',
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: video.title,
          mediaType: 1,
          sourceUrl: 'https://youtube.com',
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
      }
    };

    // Send the audio file to the user
    await client.sendMessage(command, audioMessage, { quoted: message });
  } catch (error) {
    console.error("Error fetching audio:", error);
    return repondre("An error occurred while fetching the audio. Please try again later.");
  }
});
