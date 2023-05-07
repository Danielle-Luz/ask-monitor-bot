require("dotenv/config");

const { Client, Events, GatewayIntentBits } = require("discord.js");
const { executeCommandFromCollection } = require("./commands/commands-loader");

const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
  ],
});

bot.on(Events.InteractionCreate, executeCommandFromCollection);

bot.login(BOT_TOKEN);
