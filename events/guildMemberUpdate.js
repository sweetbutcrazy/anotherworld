const { Permissions, EmbedBuilder, IntentsBitField } = require("discord.js");
const client = require('..');


client.on("guildMemberUpdate", async(newMember, oldMember) => {
  if (!oldMember.roles.cache.size !== newMember.roles.cache.size) {
      if (
        !oldMember.roles.cache.has(
          newMember.guild.roles.premiumSubscriberRole.id
        ) &&
        newMember.roles.cache.has(
          newMember.guild.roles.premiumSubscriberRole.id
        )
      ) {
        const chnl = newMember.guild.channels.cache.get('1125953407442755664');
        const boostEmbed = new EmbedBuilder()
          .setDescription(
            `> <@${newMember.user.id}>.\n\n> Thanks For Boost The Server \n> u Can DM STAFF to Make a Custom Role`
          )
          .setColor("F47FFF")
          .setFooter({
            text: `${newMember.guild.name}`,
            iconURL: newMember.guild.iconURL({ size: 1024 }),
          })
          .setTimestamp();

        chnl.send({content: newMember.user.tag, embed: boostEmbed })

      })
