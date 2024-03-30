const button = function(client, interaction) {
  if (!interaction.isButton()) return;
  if (interaction.customId === "clickmetest") {
    interaction.reply({ content: 'Beep boop, button pressed!', fetchReply: true });
  }
}

module.exports = button;