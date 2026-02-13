require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    PermissionsBitField, 
    Collection, 
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

// --- KONFIGURACJA ZAAWANSOWANA ---
const authorizedUsers = [
    '1330125473719783455', 
    '1288839682544762933', 
    '1210915481691623475' // Dodatkowe ID z dostępem
];

const xpMap = new Map(); // Prosty system XP w pamięci bota

// --- FUNKCJA AKTUALIZACJI STATUSU ---
function updateStatus() {
    const guild = client.guilds.cache.first();
    if (guild) {
        client.user.setActivity(`Społeczność: ${guild.memberCount} osób`, { 
            type: ActivityType.Watching 
        });
    }
}

// --- EVENT: READY ---
client.once('ready', () => {
    console.log(`==========================================`);
    console.log(`🚀 XWAR SMP SYSTEM ONLINE`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`🛡️ Uprawnieni: ${authorizedUsers.length} osoby`);
    console.log(`==========================================`);
    updateStatus();
    setInterval(updateStatus, 300000); // Odświeżanie co 5 minut
});

// --- EVENT: NOWY CZŁONEK ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('👋 WITAJ NA XWAR SMP!')
        .setDescription(`Siema **${member.user.username}**! Cieszymy się, że jesteś z nami.\n\n🔗 Koniecznie sprawdź: <#regulamin>\n🎮 Nasze IP: \`Xwarsmp.aternos.me\``)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields({ name: 'Numer gracza:', value: `#${member.guild.memberCount}` })
        .setFooter({ text: 'Życzymy miłej gry!' })
        .setTimestamp();

    channel.send({ embeds: [welcomeEmbed] });
});

// --- EVENT: LOGI USUNIĘTYCH WIADOMOŚCI ---
client.on('messageDelete', async message => {
    if (message.author?.bot) return;
    const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
    if (!logChannel) return;

    const logEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🗑️ WIADOMOŚĆ USUNIĘTA')
        .addFields(
            { name: 'Autor:', value: `${message.author?.tag || 'Nieznany'}`, inline: true },
            { name: 'Kanał:', value: `${message.channel}`, inline: true },
            { name: 'Treść:', value: message.content || '*Brak treści (obrazek lub embed)*' }
        )
        .setTimestamp();

    logChannel.send({ embeds: [logEmbed] });
});

// --- GŁÓWNA OBSŁUGA WIADOMOŚCI ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- SYSTEM XP (PROSTY) ---
    const currentXP = xpMap.get(message.author.id) || 0;
    xpMap.set(message.author.id, currentXP + 1);

    const msg = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1);

    // --- KOMENDA !SAY (AUTORYZOWANI) ---
    if (msg.startsWith('!say ')) {
        if (!authorizedUsers.includes(message.author.id)) return;
        const text = message.content.slice(5);
        if (!text) return;
        
        await message.delete();
        message.channel.send(text);

        const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
        if (logChannel) logChannel.send(`✍️ **Log:** <@${message.author.id}> użył !say na ${message.channel}`);
        return;
    }

    // --- KOMENDA !OGLOSZENIE (AUTORYZOWANI) ---
    if (msg.startsWith('!ogloszenie ')) {
        if (!authorizedUsers.includes(message.author.id)) return;
        const text = message.content.slice(12);
        await message.delete();

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📢 OGŁOSZENIE ADMINISTRACJI')
            .setDescription(text)
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: `Wysłano przez: ${message.author.username}` })
            .setTimestamp();

        return message.channel.send({ content: '@everyone', embeds: [embed] });
    }

    // --- KOMENDA !SOCIAL (LINKI) ---
    if (msg === '!social') {
        const embed = new EmbedBuilder()
            .setColor('#EE82EE')
            .setTitle('📱 MEDIA SPOŁECZNOŚCIOWE')
            .setDescription('Śledź nas na bieżąco!')
            .addFields({ 
                name: 'TikTok', 
                value: '[Kliknij tutaj, aby nas zaobserwować!](https://www.tiktok.com/@kuba06909)', 
                inline: false 
            })
            .setFooter({ text: 'XWAR SMP - Dziękujemy za wsparcie!' });

        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !REGULAMIN ---
    if (msg === '!regulamin') {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
            .setDescription('Pełny regulamin znajdziesz na kanale <#regulamin>!')
            .addFields(
                { name: '🛡️ Zasada 1', value: 'Zakaz czitowania (X-Ray, Aura, Fly).', inline: false },
                { name: '🏗️ Zasada 2', value: 'Zakaz niszczenia budowli graczy.', inline: false },
                { name: '💬 Zasada 3', value: 'Zachowaj kulturę na czacie.', inline: false }
            )
            .setFooter({ text: 'Nieznajomość regulaminu nie zwalnia z kar!' });

        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !POMOC ---
    if (msg === '!pomoc') {
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('✨ CENTRUM POMOCY XWAR SMP')
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: '📍 INFORMACJE', value: '`!ip`, `!dc`, `!regulamin`, `!social`' },
                { name: '🎮 ZABAWA', value: '`!kostka`, `!moneta`, `!avatar`, `!poziom`' },
                { name: '🛠️ DLA EKIPY', value: '`!ogloszenie`, `!say`, `!clear`, `!serwer_info`' }
            )
            .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!' })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !IP ---
    if (msg === '!ip') {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎮 DANE DOŁĄCZENIA')
            .addFields(
                { name: '📍 IP', value: '`Xwarsmp.aternos.me`', inline: true },
                { name: '🔌 Port', value: '`34899`', inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !CLEAR ---
    if (msg.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj liczbę 1-100.");
        
        await message.channel.bulkDelete(amount + 1, true);
        const m = await message.channel.send(`✅ Usunięto **${amount}** wiadomości.`);
        setTimeout(() => m.delete(), 3000);
        return;
    }

    // --- KOMENDA !POZIOM ---
    if (msg === '!poziom') {
        const userXP = xpMap.get(message.author.id) || 0;
        return message.reply(`📊 Twój aktualny poziom aktywności to: **${userXP} pkt XP**.`);
    }

    // --- KOMENDA !SERWER_INFO ---
    if (msg === '!serwer_info') {
        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📊 STATYSTYKI: ${message.guild.name}`)
            .addFields(
                { name: 'Okręg:', value: 'Polska', inline: true },
                { name: 'Właściciel:', value: `<@${message.guild.ownerId}>`, inline: true },
                { name: 'Graczy:', value: `${message.guild.memberCount}`, inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDY FUN ---
    if (msg === '!dc') return message.reply('🔗 Zaproszenie: https://discord.gg/awEJcWmM');
    if (msg === '!ping') return message.reply(`🏓 Pong! Opóźnienie: **${client.ws.ping}ms**`);
    if (msg === '!kostka') return message.reply(`🎲 Wynik rzutu: **${Math.floor(Math.random() * 6) + 1}**`);
    if (msg === '!moneta') return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
    if (msg === '!avatar') {
        const user = message.mentions.users.first() || message.author;
        return message.reply(user.displayAvatarURL({ size: 1024 }));
    }
});

// --- OBSŁUGA BŁĘDÓW (ZAPOBIEGA CRASHOM) ---
process.on('unhandledRejection', error => {
    console.error('Niezłapany błąd:', error);
});

client.login(process.env.DISCORD_TOKEN);
