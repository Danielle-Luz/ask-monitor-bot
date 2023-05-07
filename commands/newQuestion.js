const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

const newQuestionCommand = new SlashCommandBuilder()
  .setName("newquestion")
  .setDescription("Creates a new question in the 'Questions' channel")
  .addStringOption((question) => {
    question
      .setName("question")
      .setDescription("The question to be sent")
      .setRequired(true);
  });

function getQuestionsChannel(server) {
  const serverChannels = server.channels;

  const questionsChannel = serverChannels.find((channel) => {
    return channel.name == "Questions";
  });

  if (!questionsChannel) {
    throw Error(
      "A channel with name 'Questions' was not found, create a new one"
    );
  }

  return questionsChannel;
}

async function addOnQuestionChannel(interactionData) {
  const question = interactionData.options.get("question");
  const serverQuestionWasSent = interactionData.guild;

  try {
    const questionsChannel = getQuestionsChannel(serverQuestionWasSent);

    questionsChannel.send(question);
  } catch (channelNotFoundError) {
    console.error(channelNotFoundError.message);
  }
}

function getAvailableMonitors(serverMembers) {
  const availableMonitors = serverMembers.filter((member) => {
    const memberIsAvailable = member.presence.status == "online";

    const memberRoles = member.roles.cache;
    const memberIsMonitor = memberRoles.some((role) => {
      role.name == "Monitor";
    });

    return memberIsAvailable && memberIsMonitor;
  });

  return availableMonitors;
}

async function notifyAvailableMonitors(interactionData) {
  const newQuestion = interactionData.options.get("question");
  const questionSenderId = interactionData.member.id;

  const serverMembers = await interactionData.guild.members.fetch();

  const availableMonitors = getAvailableMonitors(serverMembers);

  availableMonitors.forEach((monitor) => {
    const notifyMessage = `@${questionSenderId} sent this new question: ${newQuestion}`;

    monitor.send(notifyMessage);
  });
}

async function handleNewQuestion(interactionData) {
  if (!interactionData.isChatInputCommand()) {
    return;
  }

  await addOnQuestionChannel(interactionData);
  await notifyAvailableMonitors(interactionData);
}

module.exports = {
  newQuestionCommand,
  handleNewQuestion,
};
