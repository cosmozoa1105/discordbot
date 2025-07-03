require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Discord bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (N8N_WEBHOOK_URL) {
    try {
      const response = await axios.post(N8N_WEBHOOK_URL, {
        content: message.content,
        author: message.author.username,
        channelId: message.channel.id,
      });

      console.log('Message sent to n8n webhook');

      const reply = response?.data?.content;

      if (reply) {
        await message.reply(reply);
      } else {
        await message.reply("I didn’t get a valid response from the AI.");
      }
    } catch (error) {
      console.error('Failed to send to n8n webhook:', error.message);
      await message.reply("There was an error talking to the AI.");
    }
  }

  if (message.content === '!testn8n') {
    await message.reply('Triggered n8n workflow.');
  }
});

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send("Discord bot is alive");
});

app.listen(PORT, () => {
  console.log(`Web service listening on port ${PORT}`);
});

client.login(DISCORD_BOT_TOKEN);
