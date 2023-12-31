//Discord Client
const { Client, PermissionsBitField, Permissions, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType, RoleSelectMenuBuilder, ButtonBuilder, ActionRowBuilder, EmbedBuilder, ModalBuilder, StringSelectMenuBuilder } = require('discord.js')

const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates]
})

const { REST, RequestData } = require('@discordjs/rest');
const { Routes, ButtonStyle } = require('discord-api-types/v10');

const { config } = require('./config')
const { banlist_Embed, createHubEmbed, adminDeleteEmbed, controlsEmbed, whitelist_Embed, CancelPreDelete_Embed, predelete_Embed, ownerLeave_Embed } = require('./embeds.js')
console.log(`Config Loaded prefix: ${config.prefix}`)
var owners = config.owners

//import LevelUP levelDown 
const { Level } = require('level')
const db = new Level('./db', { valueEncoding: 'json' })

var guild;
var RTCRegions;
var removeTimeouts = {};
var removeTimeoutsMsg = {};

var removeTimeouts2 = {};
var removeTimeoutsMsg2 = {};

//Ready Event
client.on('ready', async () => {
	console.log(`${client.user.tag} is Ready!`)

	/*
	client.user.setPresence({
		status: "online",
		activities: [{
			name: config.status,
			type: "LISTENING",
		}]
	})
	*/

	RTCRegions = await client.fetchVoiceRegions()
	guild = await client.guilds.cache.get(config.guild);
//	await guild.members.fetch().then(console.log).catch(/*console.error*/);
//	await guild.roles.fetch().then(console.log).catch(/*console.error*/);

	//Registering Slash
	if (config.enable_slash) {
		const rest = new REST({ version: '10' }).setToken(config.token);

		//const rest = new REST({ version: '9' }).setToken(config.token)
		const cmd1 = new SlashCommandBuilder()
			.setName('vc-fix')
			.setDescription('修復TempVCs')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		const cmd2 = new SlashCommandBuilder()
			.setName('vc-hubmsg')
			.setDescription('建立HUB訊息')
			.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		const cmd3 = new SlashCommandBuilder()
			.setName('vc-control')
			.setDescription('呼叫主控台')

		const commands = [cmd1.toJSON(), cmd2.toJSON(), cmd3.toJSON()]

		try {
			console.log('[INFO] Started refreshing application (/) commands.')

			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: commands },
			);

			console.log('[INFO] Successfully reloaded application (/) commands.')
		}
		catch (error) {
			console.error(error)
		}
	}

})

client.on('voiceStateUpdate', async (oldMember, newMember) => {

	let newUserChannel = newMember.channelId;
	let userid = newMember.id;

	/*
	console.log(newMember)
	console.log('User:',userid)
	console.log('channel:',newUserChannel);   
	console.log('=======')
	*/

	let tempVcId = await db.get(`tempVcIdKey_${userid}`).catch(err => { }) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempTimestamp = await db.get(`tempTimestampKey_${userid}`).catch(err => { }) //= await kvs1.get('tempTimestampKey_'+userid);

	if (newUserChannel == config.HUBvcChannelID) {
		if (typeof tempVcId === 'undefined') {
			setTimeout(MoveUser, 1500, userid, newMember)
			return
		}
	}

	if (typeof tempVcId === 'undefined') return

	if (!newUserChannel || newUserChannel != tempVcId) {
		if (typeof tempVcId !== 'undefined') {
			if (removeTimeouts2[userid]) return
			if (removeTimeouts[userid]) return

			ownerLeave_Embed.setDescription(`房主已離開 <#${tempVcId}>。 \n頻道將於 <t:${Math.floor(Date.now() / 1000) + 180}:R> 刪除。 \n如要取消，請重新加入語音頻道。`)
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			if (!Vc) {
				await db.del(`tempVcIdKey_${userid}`).catch(err => { console.log('kv del error!') })
				await db.del(`tempmsgIdKey_${userid}`).catch(err => { console.log('kv del error!') })
				await db.del(`tempTimestampKey_${userid}`).catch(err => { console.log('kv del error!') })
				return
			}
			let msg = await Vc.send({ content: `<@${newMember.id}>`, embeds: [ownerLeave_Embed] })
			let tout = setTimeout(RemoveVTChannels, 180000, userid, tempVcId)
			removeTimeouts[userid] = tout
			removeTimeoutsMsg[userid] = msg.id
		}
	}

	if (newUserChannel == tempVcId) {
		if (removeTimeouts[userid]) {
			clearTimeout(removeTimeouts[userid])
			delete removeTimeouts[userid]
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			let Controlmsg = await Vc.messages.fetch(`${removeTimeoutsMsg[userid]}`)
			await Controlmsg.delete().catch(() => { })
		}
	}

})
async function RemoveMsg(msg) {

	await msg.delete().catch(() => { })

}

async function MoveUser(userid, Member) {
	let newVCid = await CreatVTChannels(userid);
	await Member.setChannel(newVCid).catch(err => {/*remove channel*/ })
}

async function RemoveVTChannels(UserID, VCID) {

	delete removeTimeouts2[UserID]
	delete removeTimeouts[UserID]
	let VC = guild.channels.cache.find(channel => channel.id == VCID)
	if (typeof VC !== 'undefined') VC.delete().catch(() => { console.log('VC delete error') })
	await db.del(`tempVcIdKey_${UserID}`).catch(err => { console.log('kv del error!') })
	await db.del(`tempmsgIdKey_${UserID}`).catch(err => { console.log('kv del error!') })
	await db.del(`tempTimestampKey_${UserID}`).catch(err => { console.log('kv del error!') })

}

async function CreatVTChannels(UserID) {

	let User = client.users.cache.find(user => user.id == UserID)
	const guild = await client.guilds.cache.get(config.guild)

	const newTempVoiceChannel = await guild.channels.create({
		name: `${User.username}'s VC`,
		type: ChannelType.GuildVoice,
		parent: config.categoryID,
		permissionOverwrites: [
			{
				id: config.DefaultRoleID,
				allow: [PermissionsBitField.Flags.ViewChannel],
			},
			{
				id: UserID,
				allow: [PermissionsBitField.Flags.Connect],
			},
			{
				id: UserID,
				allow: [PermissionsBitField.Flags.Speak],
			},
		],
	});

	await newTempVoiceChannel.lockPermissions().catch(console.error);
	await newTempVoiceChannel.permissionOverwrites.edit(UserID, { Speak: true, Connect: true, ViewChannel: true })
	const cmsg = await CreateControlMsg(UserID, User.username)
	const msg = await newTempVoiceChannel.send(cmsg)

	//console.log("newVC",newTempVoiceChannel)
	await db.put(`tempVcIdKey_${UserID}`, newTempVoiceChannel.id).catch(err => { console.log('kv save error!') })
	await db.put(`tempmsgIdKey_${UserID}`, msg.id).catch(err => { console.log('kv save error!') })
	await db.put(`tempTimestampKey_${UserID}`, Date.now() / 1000).catch(err => { console.log('kv save error!') })
	return newTempVoiceChannel.id
	//await kvs1.set('tempVcIdKey_'+UserID,newTempVoiceChannel.id);
	//await kvs1.set('tempTcIdKey_'+UserID,newTempTxTChannel.id);
	//await kvs1.set('tempTimestampKey_'+UserID,Date.now());

}

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isRoleSelectMenu() && !interaction.isRoleSelectMenu && !interaction.isModalSubmit() && !interaction.isButton() && !interaction.isSelectMenu() && !interaction.isCommand()) return
	const guild = client.guilds.cache.get(config.guild);
	let textchannel = interaction.channel
	let user = interaction.user
	let tempVcId = await db.get(`tempVcIdKey_${user.id}`).catch(err => { }) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempmsgid = await db.get(`tempmsgIdKey_${user.id}`).catch(err => { }) //= await kvs1.get('tempVcIdKey_'+userid);
	let tempTimestamp = await db.get(`tempTimestampKey_${user.id}`).catch(err => { }) //= await kvs1.get('tempVcIdKey_'+userid);
	let VC = await guild.channels.fetch(tempVcId)

	if (interaction.isRoleSelectMenu() || interaction.isUserSelectMenu()) {
		if (interaction.customId == "menu_whitelist_member" || interaction.customId == "menu_whitelist_role") {
			//whitelist_Embed.setDescription(".....")
			await interaction.update({ ephemeral: true, components: [], content: "", embeds: [whitelist_Embed] })


			if (interaction.customId == "menu_whitelist_role") {
				let wrole = guild.roles.cache.find(role => role.id == interaction.values[0])
				//console.log(await VC.permissionsFor(wrole.id))
				let VCPermissions = await VC.permissionsFor(wrole.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				//console.log(VCPermissions)
				if (!VCPermissions.ViewChannel) {
					await VC.permissionOverwrites.create(wrole.id, { ViewChannel: true })
				} else {
					await VC.permissionOverwrites.delete(wrole.id)
				}

			} else {

				let wUserid = client.users.cache.find(user => user.id == interaction.values[0])
				let VCPermissions = await VC.permissionsFor(wUserid.id).serialize()
				//console.log(typeof(VCPermissions.VIEW_CHANNEL))
				//console.log(VCPermissions)
				if (!VCPermissions.ViewChannel) {
					await VC.permissionOverwrites.create(wUserid.id, { ViewChannel: true })
				} else {
					await VC.permissionOverwrites.delete(wUserid.id)
				}
			}
			var str1_role = "", str1_member = ""
			VC.permissionOverwrites.cache.forEach((value) => {
				let VCperm = value.allow.serialize()
				if (!VCperm.ViewChannel) return
				if (value.type == 0) {
					str1_role += `<@&${value.id}>\n`
				} else if (value.type == 1) {
					str1_member += `<@${value.id}>\n`
				}
			})
			whitelist_Embed.setFields([
				{ name: 'Roles', value: `${str1_role != "" ? str1_role : 'none'}`, inline: true },
				{ name: 'Members', value: `${str1_member != "" ? str1_member : 'none'}`, inline: true }
			])
			const userselectmenu = new UserSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_whitelist_member')
				.setPlaceholder('選擇使用者')

			const roleselectmenu = new RoleSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_whitelist_role')
				.setPlaceholder('選擇身分組')

			const row1 = new ActionRowBuilder()
				.addComponents(userselectmenu)
			const row2 = new ActionRowBuilder()
				.addComponents(roleselectmenu)
			return await interaction.editReply({ ephemeral: true, content: "", components: [row1, row2], embeds: [whitelist_Embed] });


		} else if (interaction.customId == "menu_banlist_member" || interaction.customId == "menu_banlist_role") {
			await interaction.update({ ephemeral: true, components: [], content: "" })


			if (interaction.customId == "menu_banlist_role") {
				let banrole = guild.roles.cache.find(role => role.id == interaction.values[0])
				let VCPermissions = VC.permissionOverwrites.cache.find(value => value.id == banrole.id)

				if (typeof VCPermissions === 'undefined' || !VCPermissions.deny.serialize().ViewChannel) {
					await VC.permissionOverwrites.create(banrole.id, { ViewChannel: false })
				} else {
					await VC.permissionOverwrites.delete(banrole.id)
				}
			} else {
				let banUserid = guild.members.cache.find(user => user.id == interaction.values[0])
				if (banUserid.voice.channelId == VC.id) await banUserid.voice.disconnect().catch()

				let VCPermissions = VC.permissionOverwrites.cache.find(value => value.id == banUserid.id)
				if (typeof VCPermissions === 'undefined' || !VCPermissions.deny.serialize().ViewChannel) {
					await VC.permissionOverwrites.create(banUserid.id, { ViewChannel: false })
				} else {
					await VC.permissionOverwrites.delete(banUserid.id)
				}

			}
			var str1_role = "", str1_member = ""
			VC.permissionOverwrites.cache.forEach((value) => {
				let VCperm = value.allow.serialize()
				if (VCperm.ViewChannel || typeof value === 'undefined') return
				if (value.type == 0) {
					str1_role += `<@&${value.id}>\n`
				} else if (value.type == 1) {
					str1_member += `<@${value.id}>\n`
				}
			})
			banlist_Embed.setFields([
				{ name: 'Roles', value: `${str1_role != "" ? str1_role : 'none'}`, inline: true },
				{ name: 'Members', value: `${str1_member != "" ? str1_member : 'none'}`, inline: true }
			])

			const userselectmenu = new UserSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_banlist_member')
				.setPlaceholder('選擇使用者')

			const roleselectmenu = new RoleSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_banlist_role')
				.setPlaceholder('選擇身分組')

			const row1 = new ActionRowBuilder()
				.addComponents(userselectmenu)
			const row2 = new ActionRowBuilder()
				.addComponents(roleselectmenu)
			return await interaction.editReply({ ephemeral: true, components: [row1, row2], embeds: [banlist_Embed] });

		}
	} else if (interaction.isStringSelectMenu()) {

		if (interaction.customId === 'select_kick') {

			let kickUser = guild.members.cache.find(user => user.id == interaction.values[0])

			await kickUser.voice.disconnect()
			return await interaction.update({ content: `OK. GoodBye ${kickUser}.`, components: [] });

		}
		else if (interaction.customId === 'select_changeowner') {

			let newUser = guild.members.cache.find(user => user.id == interaction.values[0])
			//console.log(`${newUser.nickname?newUser.nickname:newUser.user.username}'s VC`)

			await VC.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: null })

			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			let VCPermissions = await VC.permissionsFor(config.DefaultRoleID).serialize()
			Controlmsg.edit(await CreateControlMsg(newUser.id, newUser.user.username, VCPermissions))
			if (removeTimeouts[user.id]) {
				clearTimeout(removeTimeouts[user.id])
				delete removeTimeouts[userid]
				let Controlmsg = await VC.messages.fetch(`${removeTimeoutsMsg[userid]}`)
				await Controlmsg.delete().catch(() => { })
			}

			if (removeTimeouts2[user.id]) return await interaction.update({ content: `No. Vc is delete now.`, components: [] });

			await db.del(`tempVcIdKey_${user.id}`).catch(err => { console.log('kv del error!') })
			await db.del(`tempmsgIdKey_${user.id}`).catch(err => { console.log('kv del error!') })
			await db.del(`tempTimestampKey_${user.id}`).catch(err => { console.log('kv del error!') })

			await db.put(`tempVcIdKey_${newUser.id}`, tempVcId).catch(err => { console.log('kv save error!') })
			await db.put(`tempmsgIdKey_${newUser.id}`, tempmsgid).catch(err => { console.log('kv save error!') })
			await db.put(`tempTimestampKey_${newUser.id}`, tempTimestamp).catch(err => { console.log('kv save error!') })

			await interaction.update({ content: `OK. GoodBye ${user}.`, components: [] });

			await VC.setName(`${newUser.nickname ? newUser.nickname : newUser.user.username}'s VC`).catch(err => { console.log('kv save error!') })
			return

		}
		else if (interaction.customId === 'select_Region') {

			await VC.setRTCRegion(interaction.values[0] == "null" ? null : interaction.values[0])

			return await interaction.update({ content: `OK. VC RTCRegion now is ${VC.rtcRegion ? VC.rtcRegion : "Auto"}.`, components: [] });

		}
	} else if (interaction.isModalSubmit()) {

		if (interaction.customId === 'modal_limit') {

			let inputnum = interaction.fields.getTextInputValue('_value')
			if (isNaN(Number(inputnum)) || Number(inputnum) > 99 || Number(inputnum) < 0) return interaction.reply({ content: "Please enter the correct value by the owner before pressing the button.\n請輸入正確的數量後再按下按鈕。", ephemeral: true }).catch(err => { VC.send("Unknow Error. Pls try again.") })

			await VC.setUserLimit(Number(inputnum))
			return interaction.reply({ content: `OK. The UserLimit is set to ${Number(inputnum)}.\n好的，最大語音人數已設定為${Number(inputnum)}.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })

		} else if (interaction.customId === 'modal_changename') {
			await interaction.deferReply({ ephemeral: true })
			let inputstr = interaction.fields.getTextInputValue('_value')

			await VC.setName(inputstr)
			return interaction.editReply({ content: `OK. VC name is set to ${inputstr}.\n好的，已將名子更改為${inputstr}.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })

		}

	} else if (interaction.isButton()) {
		if (tempVcId != textchannel.id) {
			return await interaction.reply({ content: "Uhhhhh... This is not your VC.", ephemeral: true }).catch(err => { console.log(err) })
		}

		let VCPermissions = await VC.permissionsFor(config.DefaultRoleID).serialize()
		//console.log(VCPermissions)

		if (interaction.customId === "button_lock") {

			await interaction.deferReply({ ephemeral: true })
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			var VcPermissions = VCPermissions

			//console.log(VCPermissions)
			VcPermissions.Connect = !VcPermissions.Connect
			await VC.permissionOverwrites.edit(user.id, { Connect: true })
			await VC.permissionOverwrites.edit(config.DefaultRoleID, { Connect: VcPermissions.Connect })


			await Controlmsg.edit(await CreateControlMsg(user.id, user.username, VcPermissions))
			await interaction.editReply({ content: `Now everyone **can${!VcPermissions.Connect ? "not** " : "** "}connect to this channel.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			return

		}
		else if (interaction.customId === "button_hide") {
			await interaction.deferReply({ ephemeral: true })
			var VcPermissions = VCPermissions
			VcPermissions.ViewChannel = !VcPermissions.ViewChannel
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)
			//console.log(VCPermissions)
			await VC.permissionOverwrites.edit(user.id, { ViewChannel: true })
			await VC.permissionOverwrites.edit(config.DefaultRoleID, { ViewChannel: VcPermissions.ViewChannel })

			await Controlmsg.edit(await CreateControlMsg(user.id, user.username, VcPermissions))
			await interaction.editReply({ content: `Now everyone **can${!VcPermissions.ViewChannel ? "not** " : "** "}see this channel.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			return
		}
		else if (interaction.customId === "button_mute") {
			await interaction.deferReply({ ephemeral: true })

			var VcPermissions = VCPermissions
			VcPermissions.Speak = !VcPermissions.Speak
			let Controlmsg = await VC.messages.fetch(`${tempmsgid}`)

			//console.log(VCPermissions)
			await VC.permissionOverwrites.edit(user.id, { Speak: true })
			await VC.permissionOverwrites.edit(config.DefaultRoleID, { Speak: VcPermissions.Speak })

			await Controlmsg.edit(await CreateControlMsg(user.id, user.username, VcPermissions))
			await interaction.editReply({ content: `Now new join user **can${VcPermissions.Speak ? "**" : "not**"} Speak.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			return
		}
		else if (interaction.customId === "button_limit") {

			const modal = new ModalBuilder()
				.setCustomId('modal_limit')
				.setTitle('Set User limit');
			const MessageInput = new TextInputBuilder()
				.setCustomId("_value")
				.setLabel("User limit")
				.setPlaceholder("Type number here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(2)
				.setStyle(TextInputStyle.Short)
			modal.addComponents(new ActionRowBuilder().addComponents(MessageInput));
			return await interaction.showModal(modal);

		}
		else if (interaction.customId === "button_ban") {

			var str1_role = "", str1_member = ""
			VC.permissionOverwrites.cache.forEach((value) => {
				let VCperm = value.allow.serialize()
				if (VCperm.ViewChannel || typeof value === 'undefined') return
				if (value.type == 0) {
					str1_role += `<@&${value.id}>\n`
				} else if (value.type == 1) {
					str1_member += `<@${value.id}>\n`
				}
			})
			banlist_Embed.setFields([
				{ name: 'Roles', value: `${str1_role != "" ? str1_role : 'none'}`, inline: true },
				{ name: 'Members', value: `${str1_member != "" ? str1_member : 'none'}`, inline: true }
			])

			const userselectmenu = new UserSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_banlist_member')
				.setPlaceholder('選擇使用者')

			const roleselectmenu = new RoleSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_banlist_role')
				.setPlaceholder('選擇身分組')

			const row1 = new ActionRowBuilder()
				.addComponents(userselectmenu)
			const row2 = new ActionRowBuilder()
				.addComponents(roleselectmenu)
			return await interaction.reply({ ephemeral: true, components: [row1, row2], embeds: [banlist_Embed] });


		}
		else if (interaction.customId === "button_kick") {
			await interaction.deferReply({ ephemeral: true })
			let kickUser = VC.members

			//console.log(banUser)
			if (kickUser.size <= 1) return interaction.editReply({ content: `Error cannot find user.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			const row = new ActionRowBuilder()

			if (kickUser.size > 1) {
				var options = []
				var index = 0
				kickUser.forEach((user) => {
					if (user.id == interaction.user.id) return
					index += 1
					if (index <= 25) {
						options.push({
							label: user.user.username,
							description: user.nickname ? user.nickname : user.user.username,
							value: user.id,
						})
					}
				});

				let msmComponents = new MessageSelectMenu()
					.setCustomId('select_kick')
					.setPlaceholder('Nothing selected')
					.addOptions(options)
				row.addComponents(msmComponents);
			}

			return await interaction.editReply({ content: 'Please select the one you want.', components: [row], ephemeral: true });


		}
		else if (interaction.customId === "button_changename") {

			const modal = new ModalBuilder()
				.setCustomId('modal_changename')
				.setTitle('Change VC Name');
			const MessageInput = new TextInputBuilder()
				.setCustomId("_value")
				.setLabel("Name")
				.setPlaceholder("Type name here")
				.setRequired(true)
				.setMinLength(1)
				.setMaxLength(4000)
				.setStyle(TextInputStyle.Short)
			modal.addComponents(new ActionRowBuilder().addComponents(MessageInput));
			return await interaction.showModal(modal);

		}
		else if (interaction.customId === "button_changeowner") {
			await interaction.deferReply({ ephemeral: true })
			let finedUser = VC.members
			//console.log(banUser)
			if (finedUser.size <= 1) return interaction.editReply({ content: `Error cannot find user.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			const row = new ActionRowBuilder()

			if (finedUser.size > 1) {
				var options = []
				var index = 0
				finedUser.forEach((user) => {

					index += 1
					if (index <= 25) {
						options.push({
							label: user.user.username,
							description: user.nickname ? user.nickname : user.user.username,
							value: user.id,
							default: user.id == interaction.user.id,
						})
					}
				});

				let msmComponents = new MessageSelectMenu()
					.setCustomId('select_changeowner')
					.setPlaceholder('Nothing selected')
					.addOptions(options)
				row.addComponents(msmComponents);
			}

			return await interaction.editReply({ content: 'Please select the one you want.', components: [row], ephemeral: true });


		}
		else if (interaction.customId === "button_delete") {
			let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
			if (removeTimeouts[user.id]) return
			if (removeTimeouts2[user.id]) {
				let cmsg = await Vc.send({ embeds: [CancelPreDelete_Embed] })
				setTimeout(RemoveMsg, 5000, cmsg)
				let Controlmsg = await Vc.messages.fetch(`${removeTimeoutsMsg2[user.id]}`)
				clearTimeout(removeTimeouts2[user.id])
				delete removeTimeouts2[user.id]
				await Controlmsg.delete().catch(err => { console.log(err) })


			} else {

				predelete_Embed.setDescription(`房主決定將<#${tempVcId}>刪除。 \n頻道將於 <t:${Math.floor(Date.now() / 1000) + 10}:R> 刪除。 \n如要取消，請再次按下DeleteVC。`)

				let msg = await Vc.send({ embeds: [predelete_Embed] })
				let tout = setTimeout(RemoveVTChannels, 10000, user.id, tempVcId)
				removeTimeouts2[user.id] = tout
				removeTimeoutsMsg2[user.id] = msg.id

			}

			return interaction.deferUpdate()

		}
		else if (interaction.customId === "button_Region") {
			await interaction.deferReply({ ephemeral: true })

			//console.log(RTCRegions)
			if (RTCRegions.size < 1) return interaction.editReply({ content: `Error cannot find RTCRegions.`, ephemeral: true }).catch(err => { VC.send(`Something is wrong. Please try again.\nError catch: \n\`\`\` ${err}\n\`\`\``) })
			const row = new ActionRowBuilder()

			var options = []
			options.push({
				label: "自動",
				value: "null",
				default: !VC.rtcRegion,
			})
			RTCRegions.forEach((Region) => {

				options.push({
					label: Region.name,
					value: Region.id,
					default: VC.rtcRegion == Region.id,
				})
			});

			let msmComponents = new StringSelectMenuBuilder()
				.setCustomId('select_Region')
				.setPlaceholder('Nothing selected')
				.addOptions(options)
			row.addComponents(msmComponents);

			return await interaction.editReply({ content: 'Please select a Region you want.', components: [row], ephemeral: true });


		}
		else if (interaction.customId === "button_whitelist") {

			var str1_role = "", str1_member = ""
			VC.permissionOverwrites.cache.forEach((value) => {
				let VCperm = value.allow.serialize()
				if (!VCperm.ViewChannel) return
				if (value.type == 0) {
					str1_role += `<@&${value.id}>\n`
				} else if (value.type == 1) {
					str1_member += `<@${value.id}>\n`
				}
			})
			whitelist_Embed.setFields([
				{ name: 'Roles', value: `${str1_role != "" ? str1_role : 'none'}`, inline: true },
				{ name: 'Members', value: `${str1_member != "" ? str1_member : 'none'}`, inline: true }
			])

			const userselectmenu = new UserSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_whitelist_member')
				.setPlaceholder('選擇使用者')

			const roleselectmenu = new RoleSelectMenuBuilder()
				.setMaxValues(1)
				.setCustomId('menu_whitelist_role')
				.setPlaceholder('選擇身分組')

			const row1 = new ActionRowBuilder()
				.addComponents(userselectmenu)
			const row2 = new ActionRowBuilder()
				.addComponents(roleselectmenu)
			return await interaction.reply({ ephemeral: true, components: [row1, row2], embeds: [whitelist_Embed] });

		}
		return await interaction.deferUpdate().catch()
	} else if (interaction.isCommand()) {
		if (interaction.commandName == "vc-fix") {
			await interaction.deferReply()
			if (!config.owners.includes(user.id)) return
			for await (const key of db.keys()) {
				if (key.startsWith('tempVcIdKey_')) {
					//console.log(key)
					let uid = key.replace('tempVcIdKey_', '')
					let tempVcId = await db.get(`tempVcIdKey_${uid}`).catch(err => { }) //= await kvs1.get('tempVcIdKey_'+userid);
					let Vc = await guild.channels.cache.find(channel => channel.id == tempVcId)
					adminDeleteEmbed.setDescription(`頻道將於 <t:${Math.floor(Date.now() / 1000) + 10}:R> 刪除。`)
					Vc.send({ content: `<@${uid}>`, embeds: [adminDeleteEmbed] })
					setTimeout(RemoveVTChannels, 10000, uid, tempVcId)
				}
			}
			return await interaction.editReply({ content: 'OK. 自爆啟動.', ephemeral: true })
		}
		else if (interaction.commandName == "vc-hubmsg") {
			await interaction.deferReply()
			createHubEmbed.setAuthor({
				name: (await guild.fetchOwner()).displayName,
				iconURL: (await guild.fetchOwner()).avatarURL()
			})

			return interaction.editReply({ embeds: [createHubEmbed] })
		}
		else if (interaction.commandName == "vc-control") {
			if (tempVcId != textchannel.id) {
				return await interaction.reply({ content: "Uhhhhh... This is not your VC.", ephemeral: true }).catch(err => { console.log(err) })
			}

			await interaction.deferReply({ ephemeral: true })

			return interaction.editReply(await CreateControlMsg(user.id, user.username, VcPermissions))
		}

	}
})


async function CreateControlMsg(UserID, userName, Permissinos = { "ViewChannel": false, "Connect": true, "Speak": true, }) {

	let button1 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(`${Permissinos.Connect ? "🔒" : "🔓"}`)
		.setLabel(`${Permissinos.Connect ? "Lock" : "Unlock"}`)
		.setCustomId("button_lock")
	let button2 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(`${Permissinos.ViewChannel ? "👤" : "👥"}`)
		.setLabel(`${Permissinos.ViewChannel ? "Hide" : "Show"}`)
		.setCustomId("button_hide")
	let button3 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji(`${Permissinos.Speak ? "🔇" : "🔊"}`)
		.setLabel(`${Permissinos.Speak ? "Mute" : "Unmute"}`)
		.setCustomId("button_mute")
	let button4 = new ButtonBuilder()

		.setStyle(ButtonStyle.Danger)
		.setEmoji("🚫")
		.setLabel("ㅤBan/Unban")
		.setCustomId("button_ban")
	let button5 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji("🗒️")
		.setLabel("ㅤWhitelist/Remove")
		.setCustomId("button_whitelist")
	let button6 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji("⚠️")
		.setLabel(" Limit")
		.setCustomId("button_limit")
	let button7 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setEmoji("📲")
		.setLabel("ㅤChange Owner")
		.setCustomId("button_changeowner")
	let button8 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji("📝")
		.setLabel("ㅤChange Name")
		.setCustomId("button_changename")
	let button9 = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setEmoji("👂")
		.setLabel("Get Mention")
		.setCustomId("button_getmention")
	let button10 = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setEmoji("📃")
		.setLabel("ㅤW-list List")
		.setCustomId("button_w-list")
	let button11 = new ButtonBuilder()
		.setStyle(ButtonStyle.Secondary)
		.setEmoji("📜")
		.setLabel("ㅤBan List")
		.setCustomId("button_banlist")
	let button12 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setEmoji("💢")
		.setLabel("ㅤKick")
		.setCustomId("button_kick")
	let button13 = new ButtonBuilder()
		.setStyle(ButtonStyle.Danger)
		.setEmoji("🗑️")
		.setLabel("ㅤDelete VC")
		.setCustomId("button_delete")
	let button14 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji("🌎")
		.setLabel("ㅤChange Region")
		.setCustomId("button_Region")
	let button15 = new ButtonBuilder()
		.setStyle(ButtonStyle.Primary)
		.setEmoji("🔖")
		.setLabel("ㅤKeep VC")
		.setCustomId("button_vcKeep")
	let buttonRow1 = new ActionRowBuilder()
		.addComponents([button4, button12, button7, button13])

	let buttonRow2 = new ActionRowBuilder()
		.addComponents([button1, button2, button3, button6])

	let buttonRow3 = new ActionRowBuilder()
		.addComponents([button8, button5, button14])
	controlsEmbed.setAuthor({
		name: `${userName} 的包廂`,
		iconURL: `${client.users.cache.find(user => user.id == UserID).avatarURL()}`
	})

	return { content: `<@${UserID}>`, embeds: [controlsEmbed], components: [buttonRow1, buttonRow2, buttonRow3] }
}

client.login(config.token).catch(() => console.log('Invalid Token.Make Sure To Fill config.js or set ENV'))
