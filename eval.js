const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
 /*let embed = new Discord.RichEmbed()
  .setTitle("Evaluation")
  .setDescription("Sorry, the `eval` command can only be executed by the **DEVELOPER**.")
  .setColor("#cdf785");*/
  if (message.author.id !== "575073788111224862")  return
    function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}try {
      const code = args.join(" ");
      let evaled = eval(code);
      let rawEvaled = evaled;
      if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);
  
  let embed = new Discord.EmbedBuilder()
      .setTitle(`Evaluated in ${Math.round(client.ws.ping)}ms`)
      .addFields(
        {name: ":inbox_tray: Input", value: `\`\`\`js\n${code}\n\`\`\``, inline:false}, 
        {name: ":outbox_tray: Output", value: `\`\`\`js\n${clean(evaled).replace(process.env.TOKEN, "NO TOKEN FOR YOU!")}\n\`\`\``, inline: false}, 
        {name: 'Type', value: `\`\`\`xl\n${(typeof rawEvaled).substr(0, 1).toUpperCase() + (typeof rawEvaled).substr(1)}\n\`\`\``, inline: true}
      )
      .setColor(0x779FF);
      message.channel.send({embeds: [embed]});
    } catch (err) {
      console.log(err)
      message.channel.send(`\`ERROR\` \`\`\`js\n${clean(err)}\n\`\`\``);
    }
}

module.exports.help = {
  name: "eval", 
  aliases: [],
  description: "", 
  usage: ""
  
}