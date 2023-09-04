const { Client, GatewayIntentBits, Partials, Collection, Permissions, EmbedBuilder } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	], 
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] 
});

const fs = require('fs');
const Welcomer = require('./Welcomer.js');
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

client.on("guildMemberAdd", async member => {
    const image = new Welcomer()
    .setBackground("https://i.pinimg.com/originals/07/28/dc/0728dc400eca09632215055ff003d8bf.gif")
    .setGIF(true)
    .setAvatar(member.user.displayAvatarURL({ format: "png" }))
    .setName(member.user.username)
    .setDiscriminator(member.user.discriminator)
    .setBlur(2)

    const channel = await member.guild.channels.fetch()
    .then(channels => channels.find(x => x.id === ""))

    return channel?.send({
        files: [ new MessageAttachment(await image.generate(), "welcome.gif") ]
    })
})

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.login(process.env.TOKEN)
