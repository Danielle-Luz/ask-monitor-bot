const folderReader = require("node:fs");
const folderPathConcatenator = require("node:path");

const { Collection } = require("discord.js");

function addCommandsFromAllFilesInCollection(commandAsJson) {
  const commandsDefinitionFolderPath = folderPathConcatenator.join(
    __dirname,
    "commands-definition"
  );
  const commandsDefinitionFiles = folderReader.readdirSync(
    commandsDefinitionFolderPath
  );

  commandsCollection = new Collection();

  commandsDefinitionFiles.forEach((commandFile) => {
    const commandFilePath = folderPathConcatenator.join(
      commandsDefinitionFolderPath,
      commandFile
    );
    const commandData = require(commandFilePath);
    
    if ("data" in commandData && "execute" in commandData) {
      if (!commandAsJson) {
        commandsCollection.set(commandData.data.name, commandData);
      } else {
        commandsCollection = Array.isArray(commandsCollection)
          ? [...commandsCollection, commandData.data.toJSON()]
          : new Array();
      }
    } else {
      console.log(
        `[WARNING] The command at ${commandFilePath} must have this properties: data, execute`
      );
    }
  });

  return commandsCollection;
}

async function executeCommandFromCollection(interactionData) {
  commandsCollection = addCommandsFromAllFilesInCollection(
    interactionData.client
  );

  const commandData = commandsCollection.get(interactionData.commandName);

  if (!commandData) {
    const commandNOtFoundError = `The command /${interactionData.commandName} was not found`;

    interactionData.reply(commandNOtFoundError);
    console.error(commandNOtFoundError);

    return;
  }

  try {
    await commandData.execute(interactionData);
  } catch (error) {
    console.error(error.message);
    interactionData.reply("An error ocurred and the command was not executed");
  }
}

module.exports = {
  addCommandsFromAllFilesInCollection,
  executeCommandFromCollection,
};
