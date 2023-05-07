const { Client, Events, GatewayIntentBits } = require("discord.js");

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

bot.login(BOT_TOKEN);
