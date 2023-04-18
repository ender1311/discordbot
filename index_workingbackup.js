// Create a Discord Bot using OpenAI API that interacts on the Discord server
require("dotenv").config();

// prepare to connect to the Discord API
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

// prepare to connect to the OpenAI API
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// check for when a message on discord is sent
client.on("messageCreate", async function(message) {
    try {
        if(message.author.bot) return;
        
        const gptResponse = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message.content }],
            max_tokens: 100,
            
            // model: "davinci",
            // prompt: `ChatGPT is a friendly chatbot\n
            //         ${message.author.username}: ${message.content}\n
            //         ChatGPT:`,
            // temperature:0.9,
            // max_tokens: 100,
            // stop: ["ChatGPT:", "Ender:"],
        })

        message.reply(`${gptResponse.data.choices[0].message.content}`);
        return;
    } catch(err) {
        console.log(err);
    }
});

// Log the bot into Discord
client.login(process.env.DISCORD_TOKEN);
console.log("Bot is running");