require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const openai = new OpenAIApi(
  new Configuration({
    apiKey: OPENAI_API_KEY,
  })
);

client.once('ready', () => {
  console.log(`Discord bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Send all messages to n8n webhook
  if (N8N_WEBHOOK_URL) {
    try {
      await axios.post(N8N_WEBHOOK_URL, {
        content: message.content,
        author: message.author.username,
        channelId: message.channel.id,
      });
      console.log('Message sent to n8n webhook');
    } catch (error) {
      console.error('Failed to send to n8n webhook:', error.message);
    }
  }

  // Respond to "!ask" with OpenAI
  if (message.content.startsWith('!ask')) {
    const prompt = message.content.replace('!ask', '').trim();
    if (!prompt) return message.reply("❓ You need to ask a question.");

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      const reply = response.data.choices[0].message.content;
      await message.reply(reply);
    } catch (error) {
      console.error('OpenAI error:', error.message);
      await message.reply('⚠️ Sorry, I had trouble thinking...');
    }
  }
});

// Dummy web server to keep Render web service alive
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send("Discord bot is alive");
});

app.listen(PORT, () => {
  console.log(`Web service alive on port ${PORT}`);
});

client.login(DISCORD_BOT_TOKEN);
