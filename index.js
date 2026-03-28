require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    EmbedBuilder, 
    PermissionsBitField, 
    ChannelType,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    Collection
} = require('discord.js');
const http = require('http');

// SERWER WWW DLA RENDER
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP STATUS: ACTIVE");
    res.end();
}).listen(process.env.PORT || 10000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// KONFIGURACJA
const CONFIG = {
    COLOR: '#FF4500',
    OWNERS: ['1330125473719783455', '1288839682544762933', '1210915481691623475'],
    PREFIX: '!',
    SERVER_IP: 'xwarsmp.falix.gg',
    VERSION: '2.0.0 PRO'
};

const xpData = new Map();

// FUNKCJE POMOCNICZE
function createEmbed(title, description, color = CONFIG.COLOR) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

// STATUS BOTA
function updateStatus() {
    const guild = client.guilds.cache.first();
    if (!guild) return;
    
    const activities = [
        `🎮 IP: ${CONFIG.SERVER_IP}`,
        `👥 Graczy: ${guild.memberCount}`,
        `✨ Komenda: !pomoc`,
        `🛠️ Wersja: ${CONFIG.VERSION}`
    ];
    
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i], { type: ActivityType.Watching });
        i = (i + 1) % activities.length;
    }, 15000);
}

client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 XWAR SMP BOT ZOSTAŁ POMYŚLNIE URUCHOMIONY`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`⚙️ Wersja: ${CONFIG.VERSION}`);
    console.log(`--------------------------------------------------`);
    updateStatus();
});

// POWITANIA I AUTOMATYCZNE ROLE
client.on('guildMemberAdd', async (member) => {
    const role = member.guild.roles.cache.find(r => r.name === 'Gracz');
    if (role) member.roles.add(role).catch(() => {});

    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('👋 NOWA OSOBA NA SERWERZE!')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Witaj **${member.user.username}** na **XWAR SMP**!\n\n🔹 IP Serwera: \`${CONFIG.SERVER_IP}\`\n🔹 Przeczytaj: <#regulamin>\n🔹 Miłej zabawy!`)
            .addFields({ name: '📊 Statystyki', value: `Jesteś naszym **${member.guild.memberCount}** użytkownikiem!`, inline: true })
            .setFooter({ text: 'XWAR SMP Community', iconURL: member.guild.iconURL() });
        
        welcomeChannel.send({ content: `Witaj ${member}!`, embeds: [welcomeEmbed] });
    }
});

// SYSTEM TICKETÓW (OBSŁUGA PRZYCISKÓW)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'open_ticket') {
        const channelName = `ticket-${interaction.user.username.toLowerCase()}`;
        
        if (interaction.guild.channels.cache.find(c => c.name === channelName)) {
            return interaction.reply({ content: '⚠️ Masz już otwarte zgłoszenie!', ephemeral: true });
        }

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
                { id: '1330125473719783455', allow: [PermissionsBitField.Flags.ViewChannel] } // Przykładowe ID Admina
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎫 BIURO OBSŁUGI GRACZA')
            .setDescription(`Witaj ${interaction.user}!\n\nNapisz dokładnie, w czym możemy Ci pomóc. Zaraz ktoś z administracji zajmie się Twoim zgłoszeniem.\n\nUżyj przycisku poniżej, aby zakończyć rozmowę.`)
            .setFooter({ text: 'XWAR SMP - System Support' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('claim_ticket').setLabel('Przejmij (Admin)').setStyle(ButtonStyle.Success).setEmoji('👋')
        );

        await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
        await interaction.reply({ content: `✅ Twój ticket został utworzony: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 Zamykanie zgłoszenia za 10 sekund...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 10000);
    }

    if (interaction.customId === 'claim_ticket') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: '❌ Tylko administracja może to zrobić!', ephemeral: true });
        }
        await interaction.reply({ content: `✅ Ticket został przejęty przez: ${interaction.user.tag}` });
    }
});

// KOMENDY I SYSTEM XP
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Prosty system XP
    const userId = message.author.id;
    let userXP = xpData.get(userId) || 0;
    userXP += Math.floor(Math.random() * 5) + 1;
    xpData.set(userId, userXP);

    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // MENU POMOCY
    if (command === 'pomoc') {
        const helpEmbed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('✨ PANEL POMOCY XWAR SMP ✨')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription('Oto lista dostępnych komend bota podzielona na kategorie:')
            .addFields(
                { name: '🌐 OGÓLNE', value: '`!ip` - Informacje o serwerze\n`!dc` - Link do Discorda\n`!social` - Media społecznościowe\n`!profil` - Twoje statystyki', inline: false },
                { name: '🛠️ NARZĘDZIA', value: '`!ticket` - Otwórz system pomocy\n`!ping` - Sprawdź opóźnienie bota', inline: false },
                { name: '👮 ADMIN', value: '`!clear [ilość]` - Usuwanie czatu\n`!ogloszenie [tekst]` - Wysyłanie ogłoszenia\n`!say [tekst]` - Bot mówi za Ciebie', inline: false }
            )
            .setFooter({ text: `XWAR SMP | Komendy działają z prefiksem ${CONFIG.PREFIX}` });

        return message.reply({ embeds: [helpEmbed] });
    }

    // KOMENDA IP
    if (command === 'ip') {
        const ipEmbed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🎮 POŁĄCZ SIĘ Z NAMI')
            .addFields(
                { name: '📍 ADRES IP', value: `\`${CONFIG.SERVER_IP}\``, inline: false },
                { name: '🔌 WERSJA', value: '`1.20.1 - 1.21.x`', inline: true },
                { name: '📡 PORT', value: '`25565 (Standard)`', inline: true }
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/6073/6073874.png')
            .setFooter({ text: 'Do zobaczenia na serwerze!' });

        return message.reply({ embeds: [ipEmbed] });
    }

    // KOMENDA PROFIL (XP)
    if (command === 'profil') {
        const xp = xpData.get(message.author.id) || 0;
        const level = Math.floor(0.1 * Math.sqrt(xp));
        
        const profileEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setAuthor({ name: `Profil: ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .addFields(
                { name: '⭐ Poziom', value: `\`${level}\``, inline: true },
                { name: '📈 Doświadczenie', value: `\`${xp}\` XP`, inline: true }
            )
            .setFooter({ text: 'Pisz wiadomości, aby zdobywać XP!' });

        return message.reply({ embeds: [profileEmbed] });
    }

    // KOMENDA TICKET (SETUP)
    if (command === 'ticket') {
        if (!CONFIG.OWNERS.includes(message.author.id)) return;
        
        const setupEmbed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('📩 POTRZEBUJESZ POMOCY?')
            .setDescription('Jeśli masz problem z serwerem, chcesz zgłosić błąd lub gracza, kliknij przycisk poniżej.')
            .addFields({ name: 'Godziny pracy', value: 'Zazwyczaj odpowiadamy w kilka minut!' })
            .setFooter({ text: 'System zgłoszeń XWAR SMP' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_ticket')
                .setLabel('Otwórz Zgłoszenie')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        await message.delete();
        return message.channel.send({ embeds: [setupEmbed], components: [row] });
    }

    // KOMENDA CLEAR
    if (command === 'clear') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Nie masz uprawnień do usuwania wiadomości!');
        }
        
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('❌ Podaj liczbę od 1 do 100.');
        }

        await message.channel.bulkDelete(amount + 1, true);
        const log = await message.channel.send(`✅ Usunięto **${amount}** wiadomości.`);
        setTimeout(() => log.delete().catch(() => {}), 3000);
    }

    // KOMENDA OGLOSZENIE
    if (command === 'ogloszenie') {
        if (!CONFIG.OWNERS.includes(message.author.id)) return;
        
        const text = args.join(' ');
        if (!text) return message.reply('❌ Podaj treść ogłoszenia!');

        const announceEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🚨 WAŻNY KOMUNIKAT')
            .setDescription(text)
            .setThumbnail(message.guild.iconURL())
            .setFooter({ text: `Ogłoszenie od: ${message.author.username}` })
            .setTimestamp();

        await message.delete();
        return message.channel.send({ content: '@everyone', embeds: [announceEmbed] });
    }

    // KOMENDA SAY
    if (command === 'say') {
        if (!CONFIG.OWNERS.includes(message.author.id)) return;
        const text = args.join(' ');
        if (!text) return;
        await message.delete();
        return message.channel.send(text);
    }

    // KOMENDA SOCIAL
    if (command === 'social') {
        const socialEmbed = new EmbedBuilder()
            .setColor('#00ACEE')
            .setTitle('📲 NASZE MEDIA SPOŁECZNOŚCIOWE')
            .addFields(
                { name: '🎵 TikTok', value: '[Obserwuj nas!](https://www.tiktok.com/@kuba06909)', inline: true },
                { name: '📺 YouTube', value: '[Subskrybuj!](https://youtube.com/)', inline: true }
            )
            .setFooter({ text: 'Dziękujemy za wsparcie!' });

        return message.reply({ embeds: [socialEmbed] });
    }

    // KOMENDA PING
    if (command === 'ping') {
        return message.reply(`🏓 Pong! Opóźnienie bota: \`${client.ws.ping}ms\``);
    }
});

// LOGOWANIE BŁĘDÓW DO KONSOLI
process.on('unhandledRejection', (reason, promise) => {
    console.error('--- NIEPRZEWIDZIANY BŁĄD ---');
    console.error(reason);
});

// URUCHOMIENIE BOTA
const TOKEN = process.env.MOJ_TOCKEN || process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.log("❌ BŁĄD: Nie znaleziono tokenu bota w Environment Variables!");
} else {
    client.login(TOKEN).catch(err => {
        console.log("❌ BŁĄD LOGOWANIA:");
        console.error(err);
    });
}
