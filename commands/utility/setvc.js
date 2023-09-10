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
                .setImage(imageUrl)
                .setDescription(
                    `Hello **${message.author}**, I'm **${client.user}**. A Rich Quality Discord Music Bot. Support  Spotify, SoundCloud, Apple Music & Others. Find out what I can do using menu selection below.`,
                )
                .setFooter({
                    text: `© ${client.user.username} | Total Commands: ${client.slashCommands.size}`,
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
               })*/
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents([
                new StringSelectMenuBuilder()
                    .setCustomId("tempvc")
                    .setPlaceholder(`Select Menu Category Commands`)
                    .setMaxValues(1)
                    .setMinValues(1)
                    .setOptions(
                        categories.map((category) => {
                            return new StringSelectMenuOptionBuilder().setLabel(category).setValue(category);
                        }),
                    ),
            ]);

            message.reply({ embeds: [embed], components: [row, row2] }).then(async (msg) => {
                let filter = (i) => i.isStringSelectMenu() && i.user && i.message.author.id == client.user.id;
                let collector = await msg.createMessageComponentCollector({
                    filter,
                    time: 90000,
                });
                collector.on("collect", async (m) => {
                    if (m.isStringSelectMenu()) {
                        if (m.customId === "tempvc") {
                            await m.deferUpdate();
                            let [directory] = m.values;

                            const embed = new EmbedBuilder()
                                .setAuthor({
                                    name: `${message.guild.members.me.displayName} Help Command!`,
                                    iconURL: message.guild.iconURL({ dynamic: true }),
                                })
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
                                })*/
                                .setTimestamp();

                            msg.edit({ embeds: [embed] });
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
                            .setColor(client.color)
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
