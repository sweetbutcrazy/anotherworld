module.exports = (client, message) => {
  //)) return message.channel.send(`My Prefix Is \`${client.config.prefix}\``);
 /* if (message.content.startsWith('Linkjsjssjsjjje')) {
    message.channel.send(`<a:hya:565405176719081482> **JANGAN LUPA SHARE KE TEMEN KALIAN** \nhttps://discord.gg/cUnpxv9`)
  }
    if (message.content == '<@4547097984333288828282882385089>' || message.content == '<@!454709798733838838383433325089>') {
    message.channel.send(`Apakau Tag Tag <a:emoji_36:565405322991370260>`)
  }  
  module.exports = (client, message) => {
  //)) return message.channel.send(`My Prefix Is \`${client.config.prefix}\``);
  if (message.content.startsWith('Linkjsjssjsjjje')) {
    message.channel.send(`<a:hya:565405176719081482> **JANGAN LUPA SHARE KE TEMEN KALIAN** \nhttps://discord.gg/cUnpxv9`)
  }
    if (message.content == '<@4547097984333288828282882385089>' || message.content == '<@!454709798733838838383433325089>') {
    message.channel.send(`Apakau Tag Tag <a:emoji_36:565405322991370260>`)
  }  
  */
  
  try {
  if (message.author.bot) return;
  if (message.content.indexOf(client.config.prefix) !== 0) return;
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();
  if(message.channel.type === "dm") return;
    
  if (client.aliases.has(command)) command = client.commands.get(client.aliases.get(command)).help.name

  //if (client.commands.get(command).config.restricted == true) {
  //if (client.author.id !== client.config.owner) return message.channel.send('This Command For My Owner');
  //}
  //if (client.commands.get(command).config.args == true) {
  //if (!args[0]) return message.channel.send(`Invalid arguments. Use: ${client.config.prefix + 'help ' + client.commands.get(command).help.name}`)
  //}

  let commandFile = require(`../commands/${command}.js`);
  commandFile.run(client, message, args);
} catch (err) {
  console.error(err)
}
 }