const { SlashCommandBuilder } = require('@discordjs/builders');

const rdb = require("../database");
const fdb = require("../firebase");
const util_roles = require("../roles");
const update_roles = util_roles.update_roles;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update-roles')
		.setDescription("Use this command only if something is wrong."),
	async execute(interaction) {
		
    const guild = interaction.guild;

    fdb.getusers(function(users) {
      for (const u in users) {
        const user = users[u];
        if (user.tagid) {
          update_roles(guild, user.tagid, users);
        }
      }
    });
      
    return interaction.reply("Updated!");
	},
};