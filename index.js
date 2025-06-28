const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// If your Node version is <18, uncomment the next line to import fetch
// const fetch = require('node-fetch');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore messages from bots

  try {
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message.content,
        author: message.author.username,
        channelId: message.channel.id,
      }),
    });
  } catch (error) {
    console.error('Error sending to n8n webhook:', error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
