const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    await axios.post(process.env.N8N_WEBHOOK_URL, {
      username: message.author.username,
      content: message.content,
    });
    console.log('Sent to n8n webhook');
  } catch (error) {
    console.error('Failed to send to n8n:', error.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
