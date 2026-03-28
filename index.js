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

// ==========================================
// SERWER WWW DLA RENDER (ANTI-IDLE)
// ==========================================
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP STATUS: OK");
    res.end();
}).listen(process.env.PORT || 10000);

// ==========================================
// INICJALIZACJA KLIENTA (INTENTS)
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ]
});

// ==========================================
// KONFIGURACJA
// ==========================================
const CONFIG = {
    COLOR: '#FF4500', // Pomarańczowy XWAR
    OWNERS: ['1330125473719783455', '1288839682544762933', '1210915481691623475'],
    PREFIX: '!',
    SERVER_IP: 'xwarsmp.falix.gg',
    VERSION: '2.0.0 PRO'
};

const xpData = new Map();

// ==========================================
// STATUS BOTA (ROTACYJNY)
// ==========================================
function updateStatus() {
    const guild = client.guilds.cache.first();
    const memberCount = guild ? guild.memberCount : "...";
    
    const activities = [
        `🎮 IP: ${CONFIG.SERVER_IP}`,
        `👥 Graczy: ${memberCount}`,
        `✨ Komenda: !pomoc`,
        `🛠️ Wersja: ${CONFIG.VERSION}`
    ];
    
    let i = 0;
    setInterval(() => {
        client.user.setActivity(activities[i], { type: ActivityType.Watching });
        i = (i + 1) % activities.length;
    }, 15000);
}

// ==========================================
// EVENT: READY
// ==========================================
client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 XWAR SMP BOT ZOSTAŁ POMYŚLNIE URUCHOMIONY`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`⚙️ Wersja: ${CONFIG.VERSION}`);
    console.log(`--------------------------------------------------`);
    updateStatus();
});

// ==========================================
// EVENT: NOWY CZŁONEK (POWITANIA)
// ==========================================
client.on('guildMemberAdd', async (member) => {
    // Automatyczna rola
    const role = member.guild.roles.cache.find(r => r.name === 'Gracz');
    if (role) member.roles.add(role).catch(() => console.log("Błąd nadawania roli."));

    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('👋 WITAJ NA XWAR SMP!')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Witaj **${member.user.username}**!\n\n🔹 IP: \`${CONFIG.SERVER_IP}\`\n🔹 Zapoznaj się z kanałem <#regulamin>.\n🔹 Jesteś naszym **${member.guild.memberCount}** użytkownikiem!`)
            .setFooter({ text: 'Życzymy udanej gry!', iconURL: member.guild.iconURL() });
        
        welcomeChannel.send({ content: `Cześć ${member}!`, embeds: [welcomeEmbed] });
    }
});

// ==========================================
// SYSTEM TICKETÓW (INTERAKCJE)
// ==========================================
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
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
            ],
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎫 POMOC TECHNICZNA')
            .setDescription(`Witaj ${interaction.user}!\n\nNapisz tutaj, w czym możemy Ci pomóc. Administracja zajmie się Twoją sprawą wkrótce.`)
            .setFooter({ text: 'Użyj przycisku poniżej, aby zamknąć.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Zamknij').setStyle(ButtonStyle.Danger).setEmoji('🔒')
        );

        await ticketChannel.send({ embeds: [ticketEmbed], components: [row] });
        await interaction.reply({ content: `✅ Stworzono ticket: ${ticketChannel}`, ephemeral: true });
    }

    if (interaction.customId === 'close_ticket') {
        await interaction.reply({ content: '🔒 Usuwanie kanału za 5 sekund...' });
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
    }
});

// ==========================================
// GŁÓWNA OBSŁUGA WIADOMOŚCI
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // System XP
    const userId = message.author.id;
    let userXP = xpData.get(userId) || 0;
    userXP += 1;
    xpData.set(userId, userXP);

    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // KOMENDA: POMOC
    if (command === 'pomoc') {
        const helpEmbed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('✨ PANEL POMOCY XWAR SMP ✨')
            .addFields(
                { name: '🌐 OGÓLNE', value: '`!ip`, `!social`, `!dc`, `!profil`, `!ping`' },
                { name: '🛠️ NARZĘDZIA', value: '`!ticket` - Panel zgłoszeń' },
                { name: '👮 ADMIN', value: '`!clear [ilość]`, `!ogloszenie [tekst]`, `!say [tekst]`' }
            )
            .setFooter({ text: `Prefiks: ${CONFIG.PREFIX}` });

        return message.reply({ embeds: [helpEmbed] });
    }

    // KOMENDA: IP
    if (command === 'ip') {
        return message.reply({ embeds: [
            new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('🎮 ADRES IP SERWERA')
                .setDescription(`🚀 IP: \`${CONFIG.SERVER_IP}\`\n🔌 Wersja: \`1.20.1 - 1.21.x\``)
        ]});
    }

    // KOMENDA: PROFIL
    if (command === 'profil') {
        const xp = xpData.get(message.author.id) || 0;
        const level = Math.floor(0.2 * Math.sqrt(xp));
        return message.reply(`⭐ **Twój Profil**\nLevel: \`${level}\`\nXP: \`${xp}\``);
    }

    // KOMENDA: TICKET (ADMIN)
    if (command === 'ticket') {
        if (!CONFIG.OWNERS.includes(message.author.id)) return;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Otwórz Ticket').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );
        const embed = new EmbedBuilder().setTitle('📩 POMOC').setDescription('Kliknij przycisk, aby porozmawiać z Administracją.').setColor('#2C3E50');
        await message.delete();
        return message.channel.send({ embeds: [embed], components: [row] });
    }

    // KOMENDA: CLEAR (ADMIN)
    if (command === 'clear') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj liczbę 1-100.");
        await message.channel.bulkDelete(amount + 1, true);
        const msg = await message.channel.send(`✅ Usunięto ${amount} wiadomości.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }

    // KOMENDA: OGLOSZENIE (ADMIN)
    if (command === 'ogloszenie') {
        if (!CONFIG.OWNERS.includes(message.author.id)) return;
        const text = args.join(' ');
        if (!text) return;
        const embed = new EmbedBuilder().setTitle('📢 OGŁOSZENIE').setDescription(text).setColor('#E74C3C').setTimestamp();
        await message.delete();
        return message.channel.send({ content: '@everyone', embeds: [embed] });
    }

    // KOMENDA: SOCIAL
    if (command === 'social') {
        return message.reply("📱 **Nasze Sociale:**\nTikTok: https://www.tiktok.com/@kuba06909");
    }

    // KOMENDA: DC
    if (command === 'dc') {
        return message.reply("🔗 **Link do Discorda:**\nhttps://discord.gg/twoj-kod");
    }
});

// ==========================================
// OBSŁUGA BŁĘDÓW I LOGOWANIE
// ==========================================
process.on('unhandledRejection', (err) => console.error('Błąd:', err));

const TOKEN = process.env.MOJ_TOCKEN;

if (!TOKEN) {
    console.log("❌ BŁĄD: Brak zmiennej MOJ_TOCKEN w Environment!");
} else {
    client.login(TOKEN).catch(e => console.error("❌ Błąd logowania:", e.message));
}
