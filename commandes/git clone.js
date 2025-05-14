const { zokou } = require("../framework/zokou");

zokou({
  'nomCom': 'github',
  'reaction': '📃',
  'categorie': "Search"
}, async (destination, zk, commandeOptions) => {
  const { ms, arg, repondre } = commandeOptions;

  const githubUsername = arg.join(" ");
  
  if (!githubUsername) {
    return repondre("Please provide a valid GitHub username, for example: `github mastertech`");
  }

  const githubApiUrl = `https://api.github.com/users/${githubUsername}`;
  
  try {
    const response = await fetch(githubApiUrl);
    const userData = await response.json();

    if (userData.message === "Not Found") {
      return repondre("User not found! Please check the username.");
    }

    const {
      id,
      name,
      login,
      bio,
      company,
      location,
      email,
      blog,
      repos_url,
      gists_url,
      followers,
      following,
    } = userData;

    const userInfo = `
      °GITHUB USER INFO°
      🚩 Id: ${id}
      🔖 Name: ${name}
      🔖 Username: ${login}
      ✨ Bio: ${bio || 'No bio available'}
      🏢 Company: ${company || 'No company info'}
      📍 Location: ${location || 'No location info'}
      📧 Email: ${email || 'No email info'}
      📰 Blog: ${blog || 'No blog available'}
      🔓 Public Repos: ${repos_url}
      🔐 Public Gists: ${gists_url}
      👪 Followers: ${followers}
      🫶 Following: ${following}
    `;

    await zk.sendMessage(destination, { text: userInfo }, { quoted: ms });
  } catch (error) {
    repondre("Error fetching data from GitHub. Please try again later.");
    console.error("GitHub API fetch error:", error);
  }
});
