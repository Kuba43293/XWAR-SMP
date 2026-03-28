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
    ButtonStyle
} = require('discord.js');
const http = require('http');

// ==========================================
// SERWER WWW (MUSI BYĆ NA POCZĄTKU)
// ==========================================
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP STATUS: OK");
    res.end();
}).listen(process.env.PORT || 10000);

// ==========================================
// INICJALIZACJA BOTA
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

const CONFIG = {
    COLOR: '#FF4500',
    OWNERS: ['1330125473719783455', '1288839682544762933', '1210915481691623475'],
    PREFIX: '!',
    SERVER_IP: 'xwarsmp.falix.gg',
    VERSION: '2.0.1 DEBUG'
};

const xpData = new Map();

// ==========================================
// STATUS BOTA
// ==========================================
function updateStatus() {
    const guild = client.guilds.cache.first();
    const count = guild ? guild.memberCount : "??";
    client.user.setActivity(`🎮 IP: ${CONFIG.SERVER_IP} | 👥 ${count}`, { type: ActivityType.Watching });
}

client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`✅ POŁĄCZONO POMYŚLNIE`);
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`--------------------------------------------------`);
    updateStatus();
    setInterval(updateStatus, 60000);
});

// ==========================================
// KOMENDY
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'pomoc') {
        const embed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('✨ PANEL XWAR SMP')
            .setDescription('Dostępne komendy: `!ip`, `!dc`, `!profil`, `!ping`, `!social`');
        return message.reply({ embeds: [embed] });
    }

    if (command === 'ip') return message.reply(`🎮 IP: \`${CONFIG.SERVER_IP}\``);
    
    if (command === 'ping') return message.reply(`🏓 Pong! \`${client.ws.ping}ms\``);

    // PANEL TICKET (Dla właścicieli)
    if (command === 'ticket' && CONFIG.OWNERS.includes(message.author.id)) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_ticket').setLabel('Otwórz Pomoc').setStyle(ButtonStyle.Primary).setEmoji('📩')
        );
        const embed = new EmbedBuilder().setTitle('📩 POMOC').setDescription('Kliknij przycisk poniżej.').setColor(CONFIG.COLOR);
        await message.delete();
        return message.channel.send({ embeds: [embed], components: [row] });
    }
});

// ==========================================
// TICKET HANDLER
// ==========================================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'open_ticket') {
        const channel = await interaction.guild.channels.create({
            name: `pomoc-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ],
        });
        await interaction.reply({ content: `✅ Kanał stworzony: ${channel}`, ephemeral: true });
    }
});

// ==========================================
// LOGOWANIE (Z DODATKOWYM SPRAWDZANIEM)
// ==========================================
const TOKEN = process.env.MOJ_TOCKEN;

if (!TOKEN || TOKEN.length < 10) {
    console.log("❌ BŁĄD: Zmienna MOJ_TOCKEN jest pusta lub nieprawidłowa!");
    console.log("Sprawdź zakładkę Environment na Renderze.");
} else {
    console.log("⏳ Próba logowania do Discorda...");
    client.login(TOKEN).catch(err => {
        console.error("❌ BŁĄD KRYTYCZNY LOGOWANIA:");
        console.error(err.message);
    });
