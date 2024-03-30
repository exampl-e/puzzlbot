const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your accounts!'),
  async execute(interaction) {
    return interaction.reply({ content: `<@${interaction.user.id}> Click [here](https://puzzl.surge.sh/account/link/?id=${interaction.user.id}) (https://puzzl.surge.sh/account/link/?id=${interaction.user.id}) to link your account! (this link should only work for you)`, fetchReply: true });
    // message.react('👍');
  },
};