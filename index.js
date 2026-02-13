require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    PermissionsBitField, 
    Collection 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// --- PEŁNA KONFIGURACJA WŁAŚCICIELI ---
const owners = ['1330125473719783455', '1288839682544762933'];

// --- SYSTEM AKTUALIZACJI STATUSU (SPOŁECZNOŚĆ) ---
function updateStatus() {
    const guild = client.guilds.cache.first();
    if (guild) {
        client.user.setActivity(`Społeczność: ${guild.memberCount}`, { 
            type: ActivityType.Watching 
        });
    }
}

client.once('ready', () => {
    console.log(`==========================================`);
    console.log(`✅ BOT XWAR SMP ZOSTAŁ POMYŚLNIE URUCHOMIONY`);
    console.log(`🛡️ Autoryzowani Właściciele: ${owners.join(', ')}`);
    console.log(`==========================================`);
    updateStatus();
    setInterval(updateStatus, 300000); // Odświeżanie co 5 minut
});

// --- ZAAWANSOWANY SYSTEM POWITAŃ ---
client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('👋 NOWY GRACZ NA POKŁADZIE!')
        .setDescription(`Siema **${member.user.username}**! Witaj na serwerze **XWAR SMP**. \n\nKoniecznie sprawdź nasz <#regulamin> i baw się dobrze! ⚔️`)
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: `Jesteś naszym ${member.guild.memberCount} członkiem!` })
        .setTimestamp();

    channel.send({ embeds: [welcomeEmbed] });
    updateStatus(); 
});

// --- SYSTEM LOGÓW ADMINISTRACYJNYCH (logi-administracyjne) ---
client.on('messageDelete', message => {
    if (message.author.bot || !message.content) return;
    const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('🗑️ USUNIĘTO WIADOMOŚĆ')
            .addFields(
                { name: 'Autor:', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Kanał:', value: `${message.channel}`, inline: true },
                { name: 'Treść wiadomości:', value: message.content || "Brak treści" }
            )
            .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
    }
});

// --- GŁÓWNA OBSŁUGA KOMEND ---
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const msg = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1);

    // --- KOMENDA !SAY (TYLKO DLA WŁAŚCICIELI) ---
    if (msg.startsWith('!say ')) {
        if (!owners.includes(message.author.id)) {
            return message.reply("❌ Ta komenda jest zarezerwowana wyłącznie dla Właścicieli!");
        }
        const sayMessage = message.content.slice(5);
        if (!sayMessage) return message.reply("Co mam powiedzieć?");
        
        await message.delete();
        
        // Logowanie do kanału administracyjnego
        const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
        if (logChannel) logChannel.send(`🛠️ **Log Say:** Właściciel <@${message.author.id}> wysłał: ${sayMessage}`);
        
        return message.channel.send(sayMessage);
    }

    // --- KOMENDA !SOCIAL (NIEBIESKIE LINKI) ---
    if (msg === '!social') {
        const socialEmbed = new EmbedBuilder()
            .setColor('#EE82EE')
            .setTitle('📱 NASZE MEDIA SPOŁECZNOŚCIOWE')
            .setDescription('Bądź na bieżąco z życiem serwera!')
            .addFields({ 
                name: 'TikTok', 
                value: '[Kliknij tutaj, aby nas zaobserwować!](https://www.tiktok.com/@kuba06909)', 
                inline: false 
            })
            .setFooter({ text: 'Dziękujemy za każde wsparcie! ❤️' });

        return message.reply({ embeds: [socialEmbed] });
    }

    // --- KOMENDA !REGULAMIN (ODSYŁACZ DO KANAŁU) ---
    if (msg === '!regulamin') {
        const regEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
            .setDescription('Pełna treść zasad znajduje się na kanale <#regulamin>!')
            .addFields(
                { name: '📍 ZASADA #1', value: 'Całkowity zakaz czitowania i wspomagaczy.', inline: false },
                { name: '📍 ZASADA #2', value: 'Zakaz niszczenia (griefowania) budowli innych.', inline: false },
                { name: '📍 ZASADA #3', value: 'Szacunek do każdego gracza i administracji.', inline: false }
            )
            .setFooter({ text: 'Nieznajomość regulaminu nie zwalnia z jego przestrzegania!' });

        return message.reply({ embeds: [regEmbed] });
    }

    // --- KOMENDA !IP (DANE SERWERA) ---
    if (msg === '!ip' || msg === '!serwer') {
        const ipEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎮 DOŁĄCZ DO XWAR SMP')
            .addFields(
                { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
                { name: '🔌 PORT', value: '`34899`', inline: true }
            )
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: 'Czekamy na Ciebie w grze! 🔥' });
        return message.reply({ embeds: [ipEmbed] });
    }

    // --- KOMENDA !CLEAR (USUWANIE WIADOMOŚCI) ---
    if (msg.startsWith('!clear ')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("❌ Nie masz uprawnień do zarządzania wiadomościami!");
        }
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj liczbę od 1 do 100.");
        
        await message.channel.bulkDelete(amount + 1);
        const m = await message.channel.send(`✅ Wyczyściłem **${amount}** wiadomości.`);
        
        const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
        if (logChannel) logChannel.send(`🧹 **Log Clear:** <@${message.author.id}> usunął ${amount} wiadomości na ${message.channel}.`);
        
        setTimeout(() => m.delete(), 3000);
        return;
    }

    // --- KOMENDA !POMOC (PEŁNE MENU Z MINIATURKĄ) ---
    if (msg === '!pomoc') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('✨ CENTRUM POMOCY XWAR SMP')
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { 
                    name: '📍 INFORMACJE', 
                    value: '`!ip` - Adres serwera\n`!dc` - Link do Discorda\n`!regulamin` - Zasady gry\n`!social` - Nasz TikTok' 
                },
                { 
                    name: '🎮 ZABAWA', 
                    value: '`!kostka` - Rzut kością\n`!moneta` - Orzeł czy reszka\n`!avatar` - Pokaż profilowe' 
                },
                { 
                    name: '🛠️ DLA EKIPY', 
                    value: '`!ogloszenie [tekst]` - Robi embed\n`!say [tekst]` - Bot mówi\n`!clear [ilość]` - Czyści czat\n`!serwer_info` - Statystyki' 
                }
            )
            .setFooter({ text: 'XWAR SMP - Najlepszy Survival!' })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // --- KOMENDA !SERWER_INFO ---
    if (msg === '!serwer_info') {
        const infoEmbed = new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle(`📊 STATYSTYKI SERWERA: ${message.guild.name}`)
            .setThumbnail(message.guild.iconURL())
            .addFields(
                { name: '👥 Liczba graczy:', value: `${message.guild.memberCount}`, inline: true },
                { name: '👑 Właściciel:', value: `<@${message.guild.ownerId}>`, inline: true },
                { name: '📅 Data powstania:', value: `${message.guild.createdAt.toLocaleDateString()}`, inline: true }
            )
            .setTimestamp();
        return message.reply({ embeds: [infoEmbed] });
    }

    // --- KOMENDY FUN ---
    if (msg === '!dc') return message.reply('🔗 Zaproś znajomych: https://discord.gg/awEJcWmM');
    if (msg === '!ping') return message.reply(`🏓 Pong! Opóźnienie bota: **${Math.round(client.ws.ping)}ms**`);
    if (msg === '!kostka') return message.reply(`🎲 Rzut kostką... Wypadło: **${Math.floor(Math.random() * 6) + 1}**`);
    if (msg === '!moneta') return message.reply(`🪙 Wynik losowania: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
    if (msg === '!avatar') {
        const user = message.mentions.users.first() || message.author;
        const avEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle(`Avatar użytkownika ${user.username}`)
            .setImage(user.displayAvatarURL({ size: 1024 }));
        return message.reply({ embeds: [avEmbed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
