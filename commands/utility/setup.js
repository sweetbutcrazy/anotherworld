const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'setup', 
    description: "To Setup Temp Voice", 
    run: async (interaction) => {

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
	}
} 

