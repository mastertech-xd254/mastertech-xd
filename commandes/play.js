const { zokou } = require('../framework/zokou');
const yts = require('yt-search');

// Audio Download Command
zokou({
  nomCom: 'song',
  categorie: 'Download',
  reaction: '📀' 
}, async (dest, zk, commandInfo) => {
  const { repondre: reply, arg: args, ms: messageInfo } = commandInfo;

  if (!args[0]) {
    return reply('Please provide a song name.');
  }

  try {
    const searchQuery = args.join(' ');
    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      return reply('No audio found.');
    }

    const videoData = videos[0];
    const videoUrl = videoData.url;
    
    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(videoUrl)}&apikey=gifted_api_kt5gd63gjd8`;
    const apiResponse = await fetch(apiUrl);
    const result = await apiResponse.json();

    if (result.status !== 200 || !result.success) {
      return reply('Failed to download audio. Please try again later.');
    }

    const audioUrl = result.result.download_url;
    const caption = `𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛 𝗠𝗗 𝗔𝗨𝗗𝗜𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗜𝗡𝗚\n\n` +
                   `╭───────────────◆\n` +
                   `│⿻ Title: ${result.result.title}\n` +
                   `│⿻ Quality: ${result.result.quality}\n` +
                   `│⿻ Duration: ${videoData.timestamp}\n` +
                   `│⿻ Viewers: ${videoData.views}\n` + 
                   `│⿻ Uploaded: ${videoData.ago}\n` +
                   `│⿻ Artist: ${videoData.author.name}\n` +
                   `╰────────────────◆\n` +
                   `⦿ Direct Link: ${videoUrl}\n\n` +
                   `╭────────────────◆\n` +
                   `│ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗\n` +
                   `╰─────────────────◆`;

    await zk.sendMessage(dest, { 
      image: { url: videoData.thumbnail },
      caption: caption
    }, { quoted: messageInfo });

    await zk.sendMessage(dest, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4'
    }, { quoted: messageInfo });

    reply('Download successful!');

  } catch (error) {
    console.error('Error:', error);
    reply('An error occurred while processing your request.');
  }
});

// Video Download Command 
zokou({
  nomCom: 'video',
  categorie: 'Download',
  reaction: '🎥'
}, async (dest, zk, commandInfo) => {
  const { repondre: reply, arg: args, ms: messageInfo } = commandInfo;

  if (!args[0]) {
    return reply('Please provide a video name.');
  }

  try {
    const searchQuery = args.join(' ');
    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      return reply('No videos found.');
    }

    const videoData = videos[0];
    const videoUrl = videoData.url;
    
    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted_api_kt5gd63gjd8`;
    const apiResponse = await fetch(apiUrl);
    const result = await apiResponse.json();

    if (result.status !== 200 || !result.success) {
      return reply('Failed to download video. Please try again later.');
    }

    const videoDownloadUrl = result.result.download_url;
    const caption = `𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛 𝗠𝗗 𝗩𝗜𝗗𝗘𝗢 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗\n\n` +
                   `╭───────────────◆\n` +
                   `│⿻ Title: ${result.result.title}\n` +
                   `│⿻ Quality: ${result.result.quality}\n` +
                   `│⿻ Duration: ${videoData.timestamp}\n` +
                   `│⿻ Viewers: ${videoData.views}\n` + 
                   `│⿻ Uploaded: ${videoData.ago}\n` +
                   `│⿻ Channel: ${videoData.author.name}\n` +
                   `╰────────────────◆\n` +
                   `⦿ Direct Link: ${videoUrl}\n\n` +
                   `╭────────────────◆\n` +
                   `│ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗠𝗗\n` +
                   `╰─────────────────◆`;

    await zk.sendMessage(dest, { 
      image: { url: videoData.thumbnail },
      caption: caption
    }, { quoted: messageInfo });

    await zk.sendMessage(dest, {
      video: { url: videoDownloadUrl },
      mimetype: 'video/mp4'
    }, { quoted: messageInfo });

    reply('Download successful!');

  } catch (error) {
    console.error('Error:', error);
    reply('An error occurred while processing your request.');
  }
});

// Search Command
zokou({
  nomCom: 'search',
  categorie: 'Search',
  reaction: '💿'
}, async (dest, zk, commandInfo) => {
  const { repondre: reply, arg: args } = commandInfo;

  if (!args[0]) {
    return reply('Please provide a search query.');
  }

  try {
    const searchQuery = args.join(' ');
    const searchResults = await yts(searchQuery);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      return reply('No results found.');
    }

    let resultsText = '🔍 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧𝗦:\n\n';
    videos.slice(0, 5).forEach((video, index) => {
      resultsText += `*${index + 1}.* ${video.title}\n`;
      resultsText += `⏱️ ${video.timestamp} | 👁️ ${video.views} | 📅 ${video.ago}\n`;
      resultsText += `🔗 ${video.url}\n\n`;
    });

    await zk.sendMessage(dest, { text: resultsText }, { quoted: commandInfo.ms });

  } catch (error) {
    console.error('Error:', error);
    reply('An error occurred while searching.');
  }
});
