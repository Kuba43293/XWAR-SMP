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

// --- KONFIGURACJA UPRAWNIEŃ (WŁAŚCICIELE + MODERACJA) ---
const authorizedUsers = [
    '1330125473719783455', 
    '1288839682544762933', 
    '1210915481691623475' 
];

// --- MAPY DANYCH ---
const xpMap = new Map();

// --- FUNKCJA STATUSU (SPOŁECZNOŚĆ) ---
function updateStatus() {
    const guild = client.guilds.cache.first();
    if (guild) {
        client.user.setActivity(`Społeczność: ${guild.memberCount}`, { 
            type: ActivityType.Watching 
        });
    }
}

// --- EVENT: START BOTA ---
client.once('ready', () => {
    console.log(`==================================================`);
    console.log(`🚀 SYSTEM XWAR SMP ZOSTAŁ URUCHOMIONY`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`📡 Status: Oczekiwanie na graczy...`);
    console.log(`==================================================`);
    updateStatus();
    setInterval(updateStatus, 300000); 
});

// --- EVENT: POWITANIA I AUTO-ROLA ---
client.on('guildMemberAdd', async member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    
    // Nadawanie roli "Gracz" (jeśli taka istnieje)
    const role = member.guild.roles.cache.find(r => r.name === 'Gracz');
    if (role) member.roles.add(role).catch(console.error);

    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('👋 NOWY UŻYTKOWNIK NA SERWERZE!')
            .setThumbnail(member.user.displayAvatarURL())
            .setDescription(`Witaj **${member.user.username}** w naszej społeczności **XWAR SMP**!\n\n📍 Przeczytaj: <#regulamin>\n🎮 Nasze IP: \`Xwarsmp.aternos.me\``)
            .addFields(
                { name: '👤 Nick:', value: `${member.user.tag}`, inline: true },
                { name: '📊 Numer gracza:', value: `${member.guild.memberCount}`, inline: true }
            )
            .setFooter({ text: 'Życzymy udanej przygody i wielu zwycięstw!' })
            .setTimestamp();
        channel.send({ embeds: [welcomeEmbed] });
    }
    updateStatus();
});

// --- EVENT: LOGI ADMINISTRACYJNE (USUNIĘTE WIADOMOŚCI) ---
client.on('messageDelete', async message => {
    if (message.author?.bot) return;
    const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
    if (!logChannel) return;

    const logEmbed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('🗑️ LOG: USUNIĘTO WIADOMOŚĆ')
        .addFields(
            { name: 'Użytkownik:', value: `${message.author?.tag || 'Nieznany'}`, inline: true },
            { name: 'Kanał:', value: `${message.channel}`, inline: true },
            { name: 'Treść:', value: message.content || '*Brak treści (plik/obrazek)*' }
        )
        .setTimestamp();
    logChannel.send({ embeds: [logEmbed] });
});

// --- GŁÓWNA OBSŁUGA WIADOMOŚCI ---
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // --- PROSTY SYSTEM XP ---
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
        return message.channel.send(text);
    }

    // --- KOMENDA !OGLOSZENIE (AUTORYZOWANI) ---
    if (msg.startsWith('!ogloszenie ')) {
        if (!authorizedUsers.includes(message.author.id)) return;
        const text = message.content.slice(12);
        await message.delete();

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📢 WAŻNE OGŁOSZENIE XWAR SMP')
            .setDescription(text)
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: `Administrator: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.channel.send({ content: '@everyone', embeds: [embed] });
    }

    // --- KOMENDA !SOCIAL (NIEBIESKI LINK) ---
    if (msg === '!social') {
        const embed = new EmbedBuilder()
            .setColor('#EE82EE')
            .setTitle('📱 NASZE SOCIAL MEDIA')
            .addFields({ 
                name: 'TikTok', 
                value: '🚀 [Zaobserwuj nas tutaj!](https://www.tiktok.com/@kuba06909)', 
                inline: false 
            })
            .setFooter({ text: 'Dziękujemy za każde serduszko!' });
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !REGULAMIN (LINK DO KANAŁU) ---
    if (msg === '!regulamin') {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
            .setDescription('Pełną treść znajdziesz na kanale <#regulamin>!')
            .addFields(
                { name: '1️⃣ ZASADA:', value: 'Całkowity zakaz wspomagaczy i czitów.', inline: false },
                { name: '2️⃣ ZASADA:', value: 'Szanuj budowle i mienie innych graczy.', inline: false },
                { name: '3️⃣ ZASADA:', value: 'Zakaz toksyczności i obrażania innych.', inline: false }
            )
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    // --- NAPRAWIONA KOMENDA !POMOC (SZCZEGÓŁOWA) ---
    if (msg === '!pomoc') {
        const embed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('✨ PANEL POMOCY - XWAR SMP ✨')
            .setThumbnail(message.guild.iconURL())
            .setDescription('Oto szczegółowa lista wszystkich dostępnych komend bota:')
            .addFields(
                { 
                    name: '📍 INFORMACJE OGÓLNE', 
                    value: '`!ip` - Wyświetla dane do połączenia\n`!dc` - Stały link do Discorda\n`!regulamin` - Skrócone zasady\n`!social` - Klikalny link do TikToka',
                    inline: false 
                },
                { 
                    name: '🎮 GRY I ZABAWA', 
                    value: '`!kostka` - Losuje liczbę 1-6\n`!moneta` - Orzeł lub Reszka\n`!avatar` - Pokazuje Twój profil\n`!poziom` - Sprawdź swoją aktywność',
                    inline: false 
                },
                { 
                    name: '🛠️ DLA ADMINISTRACJI', 
                    value: '`!ogloszenie [tekst]` - Wysyła embed @everyone\n`!say [tekst]` - Bot pisze Twoje słowa\n`!clear [1-100]` - Usuwa wiadomości\n`!serwer_info` - Pełne statystyki DC',
                    inline: false 
                }
            )
            .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !IP ---
    if (msg === '!ip') {
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎮 DANE SERWERA')
            .addFields(
                { name: '🌍 ADRES IP:', value: '`Xwarsmp.aternos.me`', inline: true },
                { name: '🔌 PORT:', value: '`34899`', inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDA !CLEAR ---
    if (msg.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj liczbę od 1 do 100.");
        
        await message.channel.bulkDelete(amount + 1, true);
        const rep = await message.channel.send(`✅ Pomyślnie usunięto **${amount}** wiadomości.`);
        setTimeout(() => rep.delete(), 3000);
        return;
    }

    // --- KOMENDA !SERWER_INFO ---
    if (msg === '!serwer_info') {
        const embed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📊 STATYSTYKI SERWERA: ${message.guild.name}`)
            .addFields(
                { name: '👥 Członków:', value: `${message.guild.memberCount}`, inline: true },
                { name: '👑 Właściciel:', value: `<@${message.guild.ownerId}>`, inline: true },
                { name: '📅 Założono:', value: `${message.guild.createdAt.toLocaleDateString()}`, inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    // --- KOMENDY DODATKOWE ---
    if (msg === '!dc') return message.reply('🔗 Nasz Discord: https://discord.gg/awEJcWmM');
    if (msg === '!ping') return message.reply(`🏓 Latencja: **${client.ws.ping}ms**`);
    if (msg === '!poziom') return message.reply(`📊 Twój aktualny licznik wiadomości: **${xpMap.get(message.author.id) || 0}**.`);
    if (msg === '!kostka') return message.reply(`🎲 Wynik: **${Math.floor(Math.random() * 6) + 1}**`);
    if (msg === '!moneta') return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
    if (msg === '!avatar') return message.reply(message.author.displayAvatarURL({ size: 1024 }));
});

// --- ZABEZPIECZENIE PRZED CRASHEM ---
process.on('unhandledRejection', error => { console.error('BŁĄD:', error); });

client.login(process.env.DISCORD_TOKEN);
