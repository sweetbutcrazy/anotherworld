//code start here
//import all modules
const { Client, GatewayIntentBits, Collection }= require('discord.js');
const fs = require("fs");
const moment = require('moment');
const config = require("./config.json");
const MoonlinkManager = require("moonlink.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates
   ]
  })
                                 
client.moon = new MoonlinkManager([{
  host: 'localhost',
  port: 2333,
  secure: true,
  password: 'MyPassword'
}], { /* Option */ }, (guild, sPayload) => {
  client.guilds.cache.get(guild).shard.send(JSON.parse(sPayload))
})
client.moon.on('nodeCreate', (node) => {
  console.log(`${node.host} was connected`)
}) //emit to the console the node was connected to
client.moon.on('trackStart', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`${track.title} is playing now`) //when the player starts it will send a message to the channel where the command was executed
})
client.moon.on('trackEnd', async(player, track) => {
  client.channels.cache.get(player.textChannel).send(`track is over`) //when the player starts it will send a message to the channel where the command was executed
})
client.on('ready', () => {
  client.moon.init(client.user.id); //initializing the package
});
client.on('raw', (data) => {
  client.moon.packetUpdate(data) //this will send to the package the information needed for the package to work properly
})
client.on('message', async(message) => {
  if (message.content.startsWith('f!play')){
  if (!message.member.voice.channel) return message.reply({
    content: `you are not on a voice channel`,
    ephemeral: true
  });
  let player = client.moon.players.create({
    guildId: message.guild.id,
    voiceChannel: message.member.voice.channel.id,
    textChannel: message.channel.id,
    autoPlay: true
  }); //creating a player
  if (!player.connected) player.connect({
    setDeaf: true,
    setMute: false
  }) // if the player is not connected it will connect to the voice channel

  if (!player.playing) player.play()
  }
});

client.commands = new Collection();
client.events = new Collection();
client.aliases = new Collection();
client.config = config;
client.queue = new Collection()

//Command Handler
fs.readdir("./commands/", (err, files) => {
if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./commands/${ f }`);
        props.fileName = f;
        client.commands.set(props.help.name, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
})

//events handler
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
});

client.login(process.env.TOKEN);
