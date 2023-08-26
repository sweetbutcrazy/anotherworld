module.exports = (client, message) => {
  
  try {
  if (message.author.bot) return;
  if (message.content.indexOf(client.config.prefix) !== 0) return;
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  let command = args.shift().toLowerCase();
  if(message.channel.type === "dm") return;
    
  if (client.aliases.has(command)) command = client.commands.get(client.aliases.get(command)).help.name

  let commandFile = require(`../commands/${command}.js`);
  commandFile.run(client, message, args);
} catch (err) {
  console.error(err)
}
 }
