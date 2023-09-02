const { ApplicationCommandType, ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'setup', 
    description: "To Setup Temp Voice", 
    type: ApplicationCommandType.ChatInput, 
    run: async (client, interaction) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('tempv')
                    .setPlaceholder('Nothing selected')
                    // here we demand our friendly user to choose more than 2 options while less than 4 options
                    //.setMinValues(2)
                    //.setMaxValues(4)
                    .addOptions(
                        {
                            label: 'Mobile Legends',
                            description: 'Can Be Used Maxs 5 User',
                            emoji: '<:mobilelegend:589814018202402819>', 
                            value: 'mole',
                        },
                        {
                            label: 'Apex Legends',
                            description: 'Can Be Used Maxs 5 User',
                            emoji: '<:apexlegends:1126812581672259634>', 
                            value: 'apex',
                        },
                        {
                            label: 'PUBG Mobile',
                            description: 'Can Be Used Maxs 4 User',
                            emoji: ' <:pubg:589814016612892672>', 
                            value: 'pubgm',
                        },
                        {
                            label: 'Call Of Duty Mobile',
                            description: 'Can Be Used Maxs 4 User',
                            emoji: '<:codmob:1147583834334961664>', 
                            value: 'codm',
                        },
                        {
                            label: 'Among Us',
                            description: 'Can Be Used Maxs 10 User',
                            emoji: '<:amongus:1126812805622931486>', 
                            value: 'amongus',
                        },
                    ),
            );
	    
	    const embed1 = new EmbedBuilder() 
	   .setDescription('Created a Voice Channel Mobile Legends')
	   
	    await interaction.reply({ content: "Choose Ur Select", components: [row], embeds: [] });

        const filter = i => {
            return interaction.customId === 'tempv' && i.user.id === interaction.user.id;
        }

        const collector = interaction.channel.createMessageComponentCollector(
            filter,
        );

        collector.on('collect', async i=> {
          /*  await i.reply({ content: 'Selected! Fetching the detailed data relating to your choices...', components: [], embeds:[] });
            await wait(3150); // wait 3.15 secs to emulate the delay of the network
            await i.reply({content: "Here's your detailed descriptions related to your choices!", embeds: [], components: []}).delete(5000);
          */
		const value = Array.from(i.values);
            if (value.includes('mole')) {
		  const chnl = await i.guild.channels.create({
			    name: `Mobile Legends`,
			    type: 2,
			    parent: '730325949018538004', 
			    userLimit: 5,
		    })
		    await interaction.member.voice.setChannel(chnl)
		    
		    if (chnl.members.size <= 0 && chnl.members.size >= 0) {
			   await chnl.delete(5000)
		    } 
               
		    await i.reply({content: "", embeds: [embed1], components: []});
	    }
	})
    }
} 



// Create a new voice channel when the user joins the specifc voice channel


// Delete the user's voice channel when the user disconnects
/*const leftChannel = !channel_id
if (leftChannel) {
  const channels = await lib.discord.guilds['@0.1.0'].channels.list({ guild_id });
  const channel = channels.find(c => c.name === voiceChannelName)
  if (channel)
    await lib.discord.channels['@0.2.0'].destroy({ channel_id: channel.id });
  return
}*/

