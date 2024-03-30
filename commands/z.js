const { SlashCommandBuilder } = require('@discordjs/builders');
const chroma = require("chroma-js");

const rdb = require("../database");
const fdb = require("../firebase");
const util_roles = require("../roles");
const update_roles = util_roles.update_roles;

function get_category(categories, name) {
  return categories.find(c => c.name.toLowerCase() === name);
}

const colour_scale = [
  "#ffffff", // 0
  "#4287f5", // 10
  "#42f599", // 20
  "#d9e04a", // 30
  "#e0984a", // 40
  "#e04a4a", // 50
];

const disallow_permissions = {
  READ_MESSAGE_HISTORY: false,
  VIEW_CHANNEL: false,
  SEND_MESSAGES: false,
  /*
  CONNECT: false,
  SPEAK: false,
  MANAGE_MESSAGES: false,
  CREATE_INSTANT_INVITE: false,
  CREATE_PUBLIC_THREADS: false,
  CREATE_PRIVATE_THREADS: false,
  */
}

const allow_permissions = {
  READ_MESSAGE_HISTORY: true,
  VIEW_CHANNEL: true,
  SEND_MESSAGES: true,
  /*
  CONNECT: true,
  SPEAK: true,
  */
}

const funny = [
  "922489408601587773", "634982073505153024", "814996860648947792", "422087162549370880", "526068137402040339", "685875366933561394", "777978154261413898", "465681834634641408", "698433751591682148", "727595448730255370",
];
const custom_messages = {
  "697994786086584340": "👽👽👽👽👽👽👽👽👽👽",
  //[process.env.ME]: "a",
  "715521451653857351": "",
  "910844323405365358": "You are not .!#6825, so... wait...",
  "692173704653963304": "dsjaksodsjsidnbjshapwifjsklanvnjamzxjfaiwhufyagjakslajdihfbvijajdisjakslaihgusahjshgioawoqivnajksajfjgjfksflaskdpqifjaiskansajdqoijfskalaks;sjoajijaijdwajvbajasahdhajsh",
  "324025393151606784": "You are not .?#7696, so you cannot use this function. (🔴🔥)",
  "255673061515198474": "You are not .?#7696, so you cannot use this function. (🍨❤️)",
  "575730922926899203": "You are not .?#7696, so you cannot use this function. (α█)",
  "307878328759484416": "You are not .?#7696, so you cannot use this function. (3 * 397 * 79657)",
  "246354921761406978": "You are not .?#7696, so you cannot use this function. (meow)",
  "653995483127349264": "You are not .?#7696, so you cannot use this function. (♾️×♾️)",
  "280253075531235330": "You are not .?#7696, so you cannot use this function. (🥚)",
  "609761331196854403": "You are not .?#7696, so you cannot use this function. (🌧️💧♋)",
  "267556465651351557": "You are not .?#7696, so you cannot use this function. (💣)",
  "830456947626868756": "You are not .?#7696, so you cannot use this function. a",
  "634982073505153024": "You are not .?#7696, so you cannot use this function. (hi)",
  "591238233669632000": "You are not .?#7696, so you cannot use this function. [xyz]",
  "592923519512477699": "You are not .?#7696, so you cannot use this function. Ok.",
  "821617106964447243": "You are not .?#7696, so you can put this function.",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('z')
    .setDescription('Some admin thing.')
    .addStringOption(option => option.setName('t').setDescription("Type of command."))
    .addStringOption(option => option.setName('a').setDescription("Thing to do.")),
  async execute(interaction) {
    const type = interaction.options.getString('t');
    const thing = interaction.options.getString('a');

    if (funny.includes(interaction.user.id))
      return interaction.reply("Wow, it works! ...no, it doesn't.");

    if (Object.keys(custom_messages).includes(interaction.user.id))
      return interaction.reply(custom_messages[interaction.user.id]);

    if (interaction.user.id !== process.env.ME) return interaction.reply("You are not .?#7696, so you cannot use this function. Oh no.");

    const guild = interaction.guild;
    const roles = guild.roles;
    const channels = guild.channels;
    const members = guild.members;
    const user = interaction.user;
    const categories = channels.cache.filter(c => c.type === "GUILD_CATEGORY");
    //const mentioned_user = interaction.options.getUser('target');
    const role_everyone = roles.cache.find(r => r.name === '@everyone');
    if (!role_everyone) return interaction.reply("everyone doesn't exist?!");

    let answer = `Done!`;

    if (type === "channel") {

      const things = thing.split(" ");
      if (things.length !== 2) return interaction.reply("Invalid!");

      const level_type = things[0];
      const level_number = things[1];
      const level_name = level_type + "-" + things[1];
      const role_name = ((level_type === "secret") ? "found-" : "reached-") + level_name;
      const role_name_2 = (level_type === "secret") ? ("found-" + level_name) : undefined;

      // find category
      level_category = get_category(categories, level_type);
      if (!level_category) throw new Error("Category channel does not exist");

      // create channel
      channels.create(level_name, { type: "GUILD_TEXT", topic: "", position: 1000, }).then(channel => {
        console.log("Channel " + level_name + " created!");
        channel.setParent(level_category).then(channel1 => {
          // then remove @everyone permissions to channel
          channel1.permissionOverwrites.edit(roles.everyone, disallow_permissions).then(channel2 => {
            // then create role
            if (!roles.cache.find(r => r.name === role_name)) {
              roles.create({
                name: role_name,
                color: undefined,
                position: 0,
              }).then(role => {
                console.log("Role " + role_name + " created!");
                // add role permissions to channel
                channel2.permissionOverwrites.edit(role, allow_permissions);
                // add all other role permissions to channel...
                if (level_type !== "secret") {
                  for (let i = 0; i < +level_number; i++) {
                    const level_channel = level_category.children.find(c => c.name === level_type + "-" + i);
                    if (!level_channel) continue;
                    level_channel.permissionOverwrites.edit(role, allow_permissions);
                  }
                }
              }).catch(console.error);
            }
          }).catch(console.error);
        }).catch(console.error);
      }).catch(console.error);

    } else if (type === "update roles") {
      fdb.getusers(function(users) {
        for (const u in users) {
          const user = users[u];
          if (user.tagid) {
            update_roles(guild, user.tagid, users);
          }
        }
      });

    } else if (type === "colours") {
      const colours = chroma.scale(colour_scale).mode('lch').colors(10 * colour_scale.length - 10);
      console.log(colours);
      for (let i = 0; i < colours.length; i++) {
        const r = roles.cache.find(r => r.name === "reached-level-" + i);
        if (!r) break;
        r.edit({
          color: colours[i],
        });
      }

    } else if (type === "send") {
      const things = thing.split(" ");
      const id = things[0];
      const content = things.slice(1).join(" ");
      const member = guild.members.cache.find(m => m.id === id);
      if (member) {
        member.user.send({ content: content, });
      } else {
        const channel = guild.channels.cache.find(c => c.id === id);
        if (channel) {
          channel.send({ content: content, });
        }
      }

    } else if (type === "react") {
      const things = thing.split(" ");
      const id = things[0];
      const reaction = things[1];
      const message = guild.messages.cache.find(m => m.id === id);
      if (message) {
        message.react(reaction);
      }
    }

    return interaction.reply(answer);
  },
};