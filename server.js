//code start here
//import all modules
const { Client, GatewayIntentBits, Collection }= require('discord.js');
const fs = require("fs");
const moment = require('moment');
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates
   ]
  })
                                 
                                  
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
const keep_alive = require('./keep_alive.js')