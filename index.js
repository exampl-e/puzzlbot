const fs = require('fs');
require('dotenv').config();
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const TOKEN = process.env.TOKEN;
const keepAlive = require("./server");
const rdb = require("./database");
const fdb = require("./firebase");
const buttonfunction = require("./button");
const reactionfunction = require("./reaction");
const util_roles = require("./roles");
const update_roles = util_roles.update_roles;
const { exec } = require('node:child_process');

let guild = null;

// discord start
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {

  console.log("\nReady!\n");
  client.user.setActivity("puzzl.surge.sh", { type: "PLAYING", });

  // a test channel
  guild = client.guilds.cache.get(process.env.GUILD_ID);
  const testchannel = client.channels.cache.get(process.env.CHANNEL_TEST);
  const solvedchannel = client.channels.cache.get(process.env.CHANNEL_SOLVED);
  const talkchannel = client.channels.cache.get(process.env.CHANNEL_TALK);
  let oldcontent = "";
  fdb.getlevels(function(levels) {
    rdb.setlevels(levels);
  });
  fdb.getusers(function(users) {
    // solved message
    rdb.compareusers(users, function(result) {
      rdb.getlevels(function(levels) {
        for (const message of result) {
          console.log(message);
          // if (message.name == "testy") continue;
          let level = levels[message.group][message.number];
          if (level == null) {
            level = { points: 0 };
          }
          let points = level.points;
          let found = message.number === -1;
          let number = (message.number === -1) ? 0 : message.number;
          function send_message(name, member) {
            // send in #solved channel
            let content = `User ${name} has ${found ? "found" : "solved"} ${message.group} ${number} and gained **${points}** points!`;
            if (content !== oldcontent) {
              oldcontent = content;
              solvedchannel.send({ content: content, fetchReply: true, /*allowedMentions: { users: [] },*/ }).then((botmessage) => {
                if (message.tagid == "627100700643426304") {
                  botmessage.react("💀");
                }
              });
              // try to update roles
              if (message.tagid != null) {
                update_roles(guild, message.tagid, users);
                if (member != null) {
                  // also (don't) send in DMs
                  // const dm_content = `You ${found ? "found" : "solved"} ${message.group} ${number} and gained **${points}** points!`;
                  // member.send({ content: dm_content, });
                }
              }
            }

          }
          // do member thing
          if (message.tagid == null) {
            send_message(message.name);
          } else {
            guild.members.fetch(message.tagid).then(member => {
              send_message(`<@${"" + message.tagid}>`, member);
            }).catch(e => {
              send_message(message.name, null);
            });
          }
        }
      });
    });
    // update leaderboard here

  });
  // get global commands
  const commands = [];
  const excluded = ["avatar.js", "update-roles.js"];
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    if (excluded.includes(file)) continue;
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }
  // set global commands
  client.application.commands.set(commands);
  /*
  moderatortalkchannel.send("HEHEHEHEHHE HOHOHOHO");
  const thread = moderatortalkchannel.threads.cache.find(x => x.name === 'HEHEHEHEHHE HOHOHOHO');
  if (thread.joinable) thread.join();
  thread.send("HEHEHEHEHHE HOHOHOHO");
  */
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return;
  buttonfunction(client, interaction);
});

let dm_log = null;
client.on('messageCreate', async message => {
  if (message.channel.type !== "DM") return;
  if (dm_log == null) dm_log = client.channels.cache.get("942263356105064478");
  let user = message.channel.recipient;
  let username = `**${user.username}**`;
  if (user.id !== message.author.id) {
    username = `_sent this to_ **${user.username}**`;
  }
  dm_log.send(`${username}: ${message.content}`);
});

client.on('messageReactionAdd', reactionfunction);

client.on('guildMemberAdd', member => {
  console.log("User '" + member.user.username + "' joined!");
  member.roles.add(process.env.ROLE_DOT);
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  fdb.getusers(function(users) {
    update_roles(guild, member.id, users);
  });
});

client.on("debug", info => {
  console.log(info);
  let check429error = info.split(" ");
  //console.log(`info -> ${check429error}`); //debugger
  if (check429error[2] === `429`) {
    console.log(`Caught a 429 error!`);
    exec('kill 1', (err, output) => {
      if (err) {
        console.error("could not execute command: ", err);
        return;
      }
      exec('npm ci', (err, output) => {
        if (err) {
          console.error("could not execute command: ", err);
          return;
        }
        console.log(`npm ci command succeeded`); //probably wont work
      });
      console.log(`kill 1 command succeeded`); //probably wont work
    });
  }
});

client.login(TOKEN);
// discord end

exec("node ./commands.js");

keepAlive();