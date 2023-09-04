const { Client, GatewayIntentBits, Partials, Collection, Permissions, EmbedBuilder } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	], 
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] 
});

const fs = require('fs');
const config = require('./config.json');
require('dotenv').config() // remove this line if you are using replit

client.commands = new Collection()
client.aliases = new Collection()
client.slashCommands = new Collection();
client.buttons = new Collection();
client.prefix = config.prefix;

module.exports = client;


fs.readdirSync('./handlers').forEach((handler) => {
  require(`./handlers/${handler}`)(client)
});

client.on("guildMemberAdd", (member) => {
  
/*  const myIntents = new IntentsBitField();
  myIntents.add(IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.GuildMembers);
  */
  const Channel = member.guild.channels.cache.get("1127429951998672906")//.Permissions({intents: [myIntents]})
  const embed = new EmbedBuilder()
    .setDescription(`Welcome to ***Another World🌎***
U have chance to get **Nitro Boost** for free` + '\n' + 
`Check it out:` + '\n' +
`<#1142671893443387412>` + '\n' + 
`Read The Rules In :` + '\n' +
`<#1065237028788252712>` + '\n' +
`Take Your Role In :` + '\n' + 
`<#1126799549747437649>` + '\n' +
`Introduction Yourself In :` + '\n' +
`<#1077305891717652500>`)
 // .setDescription(`Read The Rules In :` + '\n' + `<#1065237028788252712>` + '\n' + `Take Your Role In :` + '\n' + `<#1126799549747437649>` + '\n' + `Introduction Yourself In :` + '\n' + `<#1077305891717652500>`)    
  .setThumbnail(member.user.avatarURL())
  .setImage('https://cdn.discordapp.com/attachments/596041860711972864/1143712429906333827/27343902-1dec-4650-bba8-28b7843a3e3f.jpg') 
  .setFooter({text: `${member.guild.name}`, iconURL: member.guild.iconURL()})
  .setTimestamp()
  Channel.send({content:`Welcome ${member.user}`, embeds: [embed]}).catch(console.error);

})

client.login(process.env.TOKEN)
