const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		return interaction.reply({ content: 'Pong!', fetchReply: true });
    // message.react('👍');
	},
};