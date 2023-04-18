require('dotenv').config();

// prepare to connect to the Discord API
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

// Prepare to connect to the OpenAI API
const openai = require('openai');
openai.apiKey = process.env.OPENAI_API_KEY;

// Check for when a message on Discord is sent
client.on('messageCreate', async function (message) {
  try {
    if (message.author.bot) return;

    // Check if the message has an attachment
    const attachment = message.attachments.first();
    let imageContent = null;

    if (attachment) {
      imageContent = { image: attachment.url };
    }

    const gptResponse = await openai.ChatCompletion.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: imageContent ? [message.content, imageContent] : message.content,
        },
      ],
      max_tokens: 100,
    });

    message.reply(`${gptResponse.choices[0].message.content}`);
    return;
  } catch (err) {
    console.log(err);
  }
});

// Log the bot into Discord
client.login(process.env.DISCORD_TOKEN);
console.log('Bot is running');
