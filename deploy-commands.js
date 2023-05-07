require("dotenv/config");

const { REST, Routes } = require("discord.js");

const {
  addCommandsFromAllFilesInCollection,
} = require("./commands/commands-loader");

async function registerBotCommands() {
  const botApi = new REST().setToken(process.env.BOT_TOKEN);
  
  const commandsCollection = Array.from(
    addCommandsFromAllFilesInCollection().values()
  ).map((commandData) => {
    return commandData.data.toJSON();
  });

  try {
    await botApi.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandsCollection,
    });
  } catch (error) {
    console.error(error.message);
  }
}

registerBotCommands();
