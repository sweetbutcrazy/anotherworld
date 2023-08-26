//code start here
//import all modules
const { Client, GatewayIntentBits, Collection }= require('discord.js');
const fs = require("fs");
const moment = require('moment');
const config = require("./config.json");
const Lava = require("@discordx/lava-player");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates
   ]
  })
                                 
const node = new Lava.Node({
  host: {
    address: process.env.LHOST ?? "",
    port: Number(process.env.LPORT) ?? 2333,
  },

  // your Lavalink password
  password: process.env.LPASS ?? "",

  send(guildId, packet) {
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      guild.shard.send(packet);
    }
  },
  shardCount: 1, // the total number of shards that your bot is running (optional, useful if you're load balancing)
  userId: client.user?.id ?? "", // the user id of your bot
});

client.ws.on("VOICE_STATE_UPDATE", (data: Lava.VoiceStateUpdate) => {
  node.voiceStateUpdate(data);
});

client.ws.on("VOICE_SERVER_UPDATE", (data: Lava.VoiceServerUpdate) => {
  node.voiceServerUpdate(data);
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
