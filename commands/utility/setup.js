const { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('select')
        .setDescription('Replies with a multi-select menu!'),
    async execute(interaction) {

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
                            value: 'mole',
                        },
                        {
                            label: 'Apex Legends',
                            description: 'Can Be Used Maxs 5 User',
                            value: 'apex',
                        },
                        {
                            label: 'PUBG Mobile',
                            description: 'Can Be Used Maxs 4 User',
                            value: 'pubgm',
                        },
                        {
                            label: 'Call Of Duty Mobile',
                            description: 'Can Be Used Maxs 4 User',
                            value: 'codm',
                        },
                        {
                            label: 'Among Us',
                            description: 'Can Be Used Maxs 10 User',
                            value: 'amongus',
                        },
                    ),
            );
