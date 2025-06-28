require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

if (!DISCORD_BOT_TOKEN) {
  console.error('ERROR: DISCORD_BOT_TOKEN is not set!');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Discord bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    if (N8N_WEBHOOK_URL) {
      await axios.post(N8N_WEBHOOK_URL, {
        content: message.content,
        author: message.author.username,
        channelId: message.channel.id,
      });
      console.log('Message sent to n8n webhook');
    }
  } catch (error) {
    console.error('Failed to send message to n8n webhook:', error.message);
  }
});

client.login(DISCORD_BOT_TOKEN);
