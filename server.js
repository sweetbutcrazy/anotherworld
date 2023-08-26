//code start here
//import all modules
const { Client, GatewayIntentBits, Collection }= require('discord.js');
const fs = require("fs");
const moment = require('moment');
const config = require("./config.json");
const Lavalink = require("@performanc/fastlink");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates
   ]
  })
                                 
const prefix = config.prefix
const events = Lavalink.node.connectNodes([{
  hostname: '127.0.0.1',
  secure: false,
  password: 'youshallnotpass',
  port: 2333
}], {
  botId: 'Your bot Id here',
  shards: 1,
  queue: true,
  debug: true
})

client.on('messageCreate', async (message) => {
  if (message.content.startsWith(prefix + 'decodetrack')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    let track = await player.decodeTrack(message.content.replace(prefix + 'decodetrack ', ''))

    return message.channel.send(JSON.stringify(track, null, 2))
  }

  if (message.content.startsWith(prefix + 'play')) {
    if (!message.member.voice.channel)
      return message.channel.send('You must be in a voice channel.')

    if (!Lavalink.node.anyNodeAvailable())
      return message.channel.send('There aren\'t nodes connected.')

    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) player.createPlayer()

    player.connect(message.member.voice.channel.id.toString(), { mute: false, deaf: true }, (guildId, payload) => {
      client.guilds.cache.get(guildId).shard.send(payload)
    })

    const music = message.content.replace(prefix + 'play ', '')
    const track = await player.loadTrack((music.startsWith('https://') ? '' : 'ytsearch:') + music)

    if (track.loadType == 'error') 
      return message.channel.send('Something went wrong. ' + track.data.message)

    if (track.loadType == 'empty')
      return message.channel.send('No matches found.')

    if (track.loadType == 'playlist') {
      player.update({ encodedTracks: track.data.tracks.map((track) => track.encoded) })

      return message.channel.send(`Added ${track.data.tracks.length} songs to the queue, and playing ${track.data.tracks[0].info.title}.`)
    }

    if (track.loadType == 'track' || track.loadType == 'short') {
      player.update({ encodedTrack: track.data.encoded, })

      return message.channel.send(`Playing ${track.data.info.title} from ${track.data.info.sourceName} from url search.`)
    }

    if (track.loadType == 'search') {
      player.update({ encodedTrack: track.data[0].encoded })

      return message.channel.send(`Playing ${track.data[0].info.title} from ${track.data[0].info.sourceName} from search.`)
    }

  }

  if (message.content.startsWith(prefix + 'volume')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    Lavalink.player.update(player, message.guild.id, {
      volume: parseInt(message.content.replace(prefix + 'volume ', ''))
    })
  }

  if (message.content.startsWith(prefix + 'pause')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    player.update({ paused: true })
  }

  if (message.content.startsWith(prefix + 'resume')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    player.update({ paused: false })
  }

  if (message.content.startsWith(prefix + 'skip')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    const skip = player.skipTrack()

    if (skip.skipped) return message.channel.send('Skipped the current track.')
    else return message.channel.send('Could not skip the current track.')
  }

  if (message.content.startsWith(prefix + 'stop')) {
    const player = new Lavalink.player.Player(message.guild.id)

    if (player.playerCreated() == false) 
      return message.channel.send('No player found.')

    player.update({ encodedTrack: null })
  }
})

client.on('raw', (data) => Lavalink.other.handleRaw(data)

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
