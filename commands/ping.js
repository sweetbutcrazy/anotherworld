const { EmbedBuilder } = require("discord.js");

module.exports.run = async (client, message, args) => {
  if (!message.channel.guild) return;

  var msg = `${Date.now() - message.createdTimestamp}`;

  var api = `${Math.round(client.ws.ping)}`;

  if (message.author.bot) return;

  let embed = new EmbedBuilder()

    .setAuthor({name:message.author.username})

    .setColor(0x7799FF)

    .addFields(
      { name: "**Latency:**", value: `${msg} ms 📶 `, inline: true} ,
      { name: "**API:**", value: `${api}ms 📶 `, inline: true
      });

  message.channel.send({ embeds: [embed] });
};

module.exports.help = {
  aliases: ["pong"],
  name: "ping",

  description: "showing a bot ping",

  usage: "<prefix>ping",
};
