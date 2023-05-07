const { SlashCommandBuilder } = require("discord.js");
const {
  questionChannelName,
  notifyAboutQuestionsRole,
} = require("./../../bot-data.json");

let notifyMonitorsStatusMessage = "";
const newQuestionCommand = new SlashCommandBuilder()
  .setName("newquestion")
  .setDescription(
    `Creates a new question in the '${questionChannelName}' channel`
  )
  .addStringOption((question) => {
    return question
      .setName("question")
      .setDescription("The question to be sent")
      .setRequired(true);
  });

function getQuestionsChannel(server) {
  const serverChannels = server.channels.cache;

  const questionsChannel = serverChannels.find((channel) => {
    return channel.name == questionChannelName;
  });

  if (!questionsChannel) {
    throw Error(
      `A channel with name '${questionChannelName}' was not found, create a new one`
    );
  }

  return questionsChannel;
}

async function addOnQuestionChannel(interactionData) {
  const question = interactionData.options.getString("question");
  const serverQuestionWasSent = interactionData.guild;

  try {
    const questionsChannel = getQuestionsChannel(serverQuestionWasSent);

    await questionsChannel.send(question);
  } catch (channelNotFoundError) {
    interactionData.reply(channelNotFoundError.message);
    console.error(channelNotFoundError.message);
  }
}

function getAvailableMonitors(serverMembers) {
  const availableMonitors = serverMembers.filter((member) => {
    const memberIsAvailable = member.presence?.status == "online";

    const memberRoles = member.roles.cache;

    const memberIsMonitor = memberRoles.some((role) => {
      return role.name == notifyAboutQuestionsRole;
    });

    return memberIsAvailable && memberIsMonitor;
  });

  return availableMonitors;
}

async function notifyAvailableMonitors(interactionData) {
  const newQuestion = interactionData.options.getString("question");
  const questionSenderId = interactionData.member.id;

  const serverMembers = await interactionData.guild.members.fetch();

  const availableMonitors = getAvailableMonitors(serverMembers);
  const noMonitorsAvailable = availableMonitors.size == 0;

  availableMonitors.forEach(async (monitor) => {
    const notifyMessage = `@${questionSenderId} sent this new question: ${newQuestion}`;

    await monitor.send(notifyMessage);
  });

  if (noMonitorsAvailable) {
    notifyMonitorsStatusMessage = `There are no members with the role '${notifyAboutQuestionsRole}' available now`;
  } else {
    notifyMonitorsStatusMessage = `The questions was submitted to the available members with the role '${notifyAboutQuestionsRole}'.'`;
  }
}

async function handleNewQuestion(interactionData) {
  if (!interactionData.isChatInputCommand()) {
    return;
  }

  if (interactionData.commandName != newQuestionCommand.name) {
    return;
  }

  await addOnQuestionChannel(interactionData);
  await notifyAvailableMonitors(interactionData);

  await interactionData.reply(
    notifyMonitorsStatusMessage +
      `\nThe question was posted in the ${questionChannelName} channel.`
  );

  notifyMonitorsStatusMessage = "";
}

module.exports = {
  data: newQuestionCommand,
  execute: handleNewQuestion,
};