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
const http = require('http');

// --- SERWER WWW DLA RENDER (ROZWIĄZUJE BŁĄD PORTÓW) ---
// Render wymaga, aby aplikacja "słuchała" na porcie, inaczej ją wyłącza
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP BOT IS ONLINE");
    res.end();
}).listen(process.env.PORT || 10000); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
});

// --- KONFIGURACJA ---
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

// --- SYSTEM AUTOMATYCZNYCH NICKÓW ---
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        for (const [roleName, prefix] of Object.entries(rankPrefixes)) {
            const role = newMember.roles.cache.find(r => r.name === roleName);
            if (role) {
                if (!newMember.displayName.startsWith(prefix)) {
                    try {
                        await newMember.setNickname(`${prefix} ${newMember.user.username}`);
                    } catch (err) {
                        console.log("Błąd nicku: Brak uprawnień bota.");
                    }
                }
                break;
            }
        }
    }
});

// --- POWITANIA ---
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
            .addFields({ name: '📊 Numer gracza:', value: `${member.guild.memberCount}`, inline: true })
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
            .setDescription(`Opisz swój problem, a administracja odpowie jak najszybciej.`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij zgłoszenie').setStyle(ButtonStyle.Danger)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `Otwarto ticket: ${channel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply("Zamykanie kanału za 5 sekund...");
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// --- OBSŁUGA KOMEND ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const msg = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1);

    if (msg === '!ip') {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎮 DANE SERWERA XWAR SMP')
            .addFields(
                { name: '🌍 ADRES IP:', value: '`xwarsmp.falix.gg`', inline: false },
                { name: '🔌 WERSJA:', value: '`1.20.1+`', inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

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

    if (msg === '!social') {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📱 NASZE SOCIAL MEDIA')
            .addFields({ name: 'TikTok', value: '🚀 [Zaobserwuj!](https://www.tiktok.com/@kuba06909)' });
        return message.reply({ embeds: [embed] });
    }

    if (msg === '!pomoc') {
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('✨ PANEL POMOCY ✨')
            .addFields(
                { name: '📍 INFO', value: '`!ip`, `!dc`, `!social`', inline: true },
                { name: '🛠️ ADMIN', value: '`!setup-ticket`, `!clear`', inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    if (msg === '!setup-ticket' && authorizedUsers.includes(message.author.id)) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Otwórz Ticket').setStyle(ButtonStyle.Success)
        );
        return message.channel.send({ content: 'Potrzebujesz pomocy? Kliknij przycisk!', components: [row] });
    }

    if (msg.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return;
        await message.channel.bulkDelete(amount + 1, true);
    }
});

process.on('unhandledRejection', error => { console.error('BŁĄD:', error); });

// KLUCZOWE: Używamy nazwy MOJ_TOCKEN bez spacji
client.login(process.env.DISCORD_TOKEN || process.env.MOJ_TOCKEN);
