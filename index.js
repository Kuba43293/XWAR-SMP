require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    PermissionsBitField, 
    Collection, 
    ChannelType,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
});

// --- KONFIGURACJA UPRAWNIEŃ I RANG ---
const authorizedUsers = [
    '1330125473719783455', 
    '1288839682544762933', 
    '1210915481691623475' 
];

const rankPrefixes = {
    'Właściciel': '[Właściciel]',
    'Budowniczy': '[Budowniczy]',
    'Gracz': '[Gracz]'
};

const xpMap = new Map();

// --- FUNKCJA STATUSU ---
function updateStatus() {
    const guild = client.guilds.cache.first();
    if (guild) {
        client.user.setActivity(`Graczy: ${guild.memberCount} | !pomoc`, { 
            type: ActivityType.Watching 
        });
    }
}

client.once('ready', () => {
    console.log(`==================================================`);
    console.log(`🚀 SYSTEM XWAR SMP ZOSTAŁ URUCHOMIONY`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`📡 Hosting: Render.com`);
    console.log(`==================================================`);
    updateStatus();
    setInterval(updateStatus, 300000); 
});

// --- SYSTEM AUTOMATYCZNYCH NICKÓW (ZGODNIE Z MC) ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        for (const [roleName, prefix] of Object.entries(rankPrefixes)) {
            const role = newMember.roles.cache.find(r => r.name === roleName);
            if (role) {
                if (!newMember.displayName.startsWith(prefix)) {
                    try {
                        await newMember.setNickname(`${prefix} ${newMember.user.username}`);
                    } catch (err) {
                        console.log("Błąd: Bot potrzebuje wyższej roli do zmiany nicków!");
                    }
                }
                break;
            }
        }
    }
});

// --- POWITANIA I AUTO-ROLA ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    const role = member.guild.roles.cache.find(r => r.name === 'Gracz');
    
    if (role) member.roles.add(role).catch(console.error);

    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('👋 NOWY GRACZ NA XWAR SMP!')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`Witaj **${member.user.username}**!\n\n📍 Przeczytaj: <#regulamin>\n🎮 Nasze IP: \`xwarsmp.falix.gg\``)
            .addFields(
                { name: '📊 Numer gracza:', value: `${member.guild.memberCount}`, inline: true }
            )
            .setTimestamp();
        channel.send({ embeds: [welcomeEmbed] });
    }
    updateStatus();
});

// --- SYSTEM TICKETÓW ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const channel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
        });

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 POMOC TECHNICZNA')
            .setDescription(`Witaj ${interaction.user}! Opisz tutaj swój problem, a administracja odpowie najszybciej jak to możliwe.`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij zgłoszenie').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `Otwarto ticket: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("Zamykanie kanału za 5 sekund...");
        setTimeout(() => interaction.channel.delete(), 5000);
    }
});

// --- GŁÓWNA OBSŁUGA WIADOMOŚCI ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const currentXP = xpMap.get(message.author.id) || 0;
    xpMap.set(message.author.id, currentXP + 1);

    const msg = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1);

    // --- KOMENDA !IP (ZMIENIONA NA FALIX.GG) ---
    if (msg === '!ip') {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎮 DANE SERWERA XWAR SMP')
            .addFields(
                { name: '🌍 ADRES IP:', value: '`xwarsmp.falix.gg`', inline: false },
                { name: '🔌 WERSJA:', value: '`1.20.1+`', inline: true }
            )
            .setThumbnail(message.guild.iconURL());
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !SAY / !OGLOSZENIE ---
    if (msg.startsWith('!say ') && authorizedUsers.includes(message.author.id)) {
        const text = message.content.slice(5);
        await message.delete();
        return message.channel.send(text);
    }

    if (msg.startsWith('!ogloszenie ') && authorizedUsers.includes(message.author.id)) {
        const text = message.content.slice(12);
        await message.delete();
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📢 OGŁOSZENIE XWAR SMP')
            .setDescription(text)
            .setTimestamp();
        return message.channel.send({ content: '@everyone', embeds: [embed] });
    }

    // --- KOMENDA !SOCIAL ---
    if (msg === '!social') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📱 NASZE SOCIAL MEDIA')
            .setDescription('Śledź nas na TikToku!')
            .addFields({ 
                name: 'TikTok', 
                value: '🚀 [Zaobserwuj tutaj!](https://www.tiktok.com/@kuba06909)', 
                inline: false 
            });
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !POMOC ---
    if (msg === '!pomoc') {
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('✨ PANEL POMOCY XWAR SMP ✨')
            .addFields(
                { name: '📍 INFO', value: '`!ip`, `!dc`, `!regulamin`, `!social`', inline: false },
                { name: '🎮 GRY', value: '`!kostka`, `!moneta`, `!avatar`, `!poziom`', inline: false },
                { name: '🛠️ ADMIN', value: '`!setup-ticket`, `!ogloszenie`, `!clear`, `!say`', inline: false }
            );
        return message.reply({ embeds: [embed] });
    }

    // --- SETUP TICKETÓW ---
    if (msg === '!setup-ticket' && authorizedUsers.includes(message.author.id)) {
        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('📩 ZGŁOŚ PROBLEM')
            .setDescription('Kliknij przycisk poniżej, aby otworzyć ticket i porozmawiać z administracją.');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Otwórz Ticket').setStyle(ButtonStyle.Success)
        );
        return message.channel.send({ embeds: [embed], components: [row] });
    }

    // --- KOMENDA !CLEAR ---
    if (msg.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj 1-100.");
        await message.channel.bulkDelete(amount + 1, true);
        const rep = await message.channel.send(`✅ Usunięto **${amount}** wiadomości.`);
        setTimeout(() => rep.delete(), 3000);
    }

    // --- KOMENDY DODATKOWE ---
    if (msg === '!dc') return message.reply('🔗 Nasz Discord: https://discord.gg/awEJcWmM');
    if (msg === '!ping') return message.reply(`🏓 Latencja: **${client.ws.ping}ms**`);
});

process.on('unhandledRejection', error => { console.error('BŁĄD:', error); });

// Używa zmiennej DISCORD_TOKEN lub MOJ_TOCKEN z Render
client.login(process.env.DISCORD_TOKEN || process.env.MOJ_TOCKEN);
