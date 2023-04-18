const { Client, Intents } = require("discord.js");
const axios = require("axios");
const fs = require("fs");
const util = require("util");

// Load environment variables
require("dotenv").config();

// Initialize Discord bot with intents
const client = new Client({
  intents: [Intents.FLAGS.Guilds, Intents.FLAGS.MessageContent],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  // Process image and text inputs
  const attachments = msg.attachments.array();
  const readFile = util.promisify(fs.readFile);
  const images = [];

  for (const attachment of attachments) {
    const imageData = await readFile(attachment.url, { encoding: "base64" });
    images.push({ image: imageData });
  }

  const content = [msg.content, ...images];

  // Call OpenAI API
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: content },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  // Post the result
  const assistantReply = response.data.choices[0].message.content;
  msg.reply(assistantReply);
});

client.login(process.env.DISCORD_TOKEN);
