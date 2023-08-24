const { Permissions, EmbedBuilder, IntentsBitField } = require("discord.js");

module.exports = (client, member) => {
  
  const myIntents = new IntentsBitField();
  myIntents.add(IntentsBitField.Flags.GuildMessages);
  
  const Channel = member.guild.channels.cache.get("1127429951998672906")//.Permissions({intents: [myIntents]})
  const embed = new EmbedBuilder()
  
  .setDescription(`Dont Forget Read The Rules In :` + '\n' + `<#1065237028788252712>` + '\n' + `Take Your Role In :` + '\n' + `<#1126799549747437649>` + '\n' + `Introduction Yourself In :` + '\n' + `<#1077305891717652500>`)    
  .setThumbnail(member.user.avatarURL())
  //.setImage(member.user.avatarURL())
  .setFooter({text: `${member.guild.name}`, iconURL: member.guild.iconURL()})
  .setTimestamp()
  Channel.send({content:`Welcome ${member.user}`, embeds: [embed]}).catch(console.error);

}