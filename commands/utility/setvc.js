const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
//const { readdirSync } = require("fs");
module.exports = {
    name: "setvc",
    description: "Display all commands of the bot.",
    category: "Information",
    aliases: ["vcset"],
    owner: false,
    run: async (client, message, args) => {
        const row2 = new ActionRowBuilder()
            .addComponents(new ButtonBuilder().setLabel("Support").setURL("https://discord.gg/anotherworldserver").setStyle(ButtonStyle.Link))
           // .addComponents(new ButtonBuilder().setLabel("Invite").setURL(inviteUrl).setStyle(ButtonStyle.Link));

        if (!args[0]) {
            //const categories = readdirSync("./src/commands/Slash/");
            const categories = ['Mobile Legends', 'Among Us'];
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${message.guild.members.me.displayName} Help Command!`,
                    iconURL: message.guild.iconURL({ dynamic: true }),
                })
               /* .setColor(client.color)
                .setImage(imageUrl)*/
                .setDescription(
                    `Hello **${message.author}**, I'm **${client.user}**. A Rich Quality Discord Music Bot. Support  Spotify, SoundCloud, Apple Music & Others. Find out what I can do using menu selection below.`,
                )
                .setFooter({
                    text: `© ${client.user.username} | Total Commands: ${client.slashCommands.size}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
               })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId("tempvc")
                    .setPlaceholder(`Select Menu Category Commands`)
                    .setMaxValues(1)
                    .setMinValues(1)
                 /*   .setOptions(
                        categories.map((category) => {
                            return new StringSelectMenuOptionBuilder().setLabel(category).setValue(category);
                        }),
                    ),*/
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
            ]);

            message.reply({ embeds: [embed], components: [row, row2] }).then(async (msg) => {
                let filter = (i) => i.customId === "tempvc" && i.isStringSelectMenu() && i.user && i.message.author.id == client.user.id;
                let collector = await msg.createMessageComponentCollector({
                    filter
                   
                });
                
                collector.on("collect", async (m) => {
                    if (m.isStringSelectMenu()) {
                        if (m.customId === "tempvc") {
                            await m.deferUpdate();
                            //let [directory] = m.values;

                          /*  const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: `${message.guild.members.me.displayName} Help Command!`,
                                    iconURL: message.guild.iconURL({ dynamic: true }),
                                })
                               .setDescription('okee')
                             /*  .setDescription(
                                    `These are all available commands for this category to use. Try adding [\`/\`] before the commands or you can just click these commands below.\n\n**❯ ${
                                        directory.slice(0, 1).toUpperCase() + directory.slice(1)
                                    }:**\n${client.slashCommands
                                        .filter((c) => c.category === directory)
                                        .map((c) => `\`${c.name}\` : *${c.description}*`)
                                        .join("\n")}`,
                                )
                               // .setColor(client.color)
                              //  .setImage(imageUrl)
                                 .setFooter({
                                    text: `© ${client.user.username} | Total Commands: ${
                                        client.slashCommands.filter((c) => c.category === directory).size
                                    }`,
                                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                                })
                                .setTimestamp();
                            */
                            const value = Array.from(m.values);
                            if (value.includes('mole')) {
                                message.channel.send('created')
                                msg.edit({ embeds: [embed] });
                            }
                        }
                    }
                });

                collector.on("end", async (collected, reason) => {
                    if (reason === "time") {
                        const timed = new EmbedBuilder()
                            .setAuthor({
                                name: `${message.guild.members.me.displayName} Help Command!`,
                                iconURL: message.guild.iconURL({ dynamic: true }),
                            })
                            .setDescription(
                                `Help Command Menu was timed out, try using \`/help\` to show the help command menu again.\n\nThank You.`,
                            )
                           // .setImage(imageUrl)
                           // .setColor(client.color)
                            .setFooter({
                                text: `© ${client.user.username} | Total Commands: ${client.slashCommands.size}`,
                                iconURL: client.user.displayAvatarURL({ dynamic: true }),
                            })
                            .setTimestamp();

                        msg.edit({ embeds: [timed], components: [row2] });
                    }
                });
            });
        }
    },
};
