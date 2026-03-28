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
// SERWER WWW (PODSTAWA DLA RENDERA)
// ==========================================
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP STATUS: OK - BOT IS RUNNING");
    res.end();
}).listen(process.env.PORT || 10000, () => {
    console.log("🌐 Serwer WWW dla Rendera nasłuchuje na porcie 10000");
});

// ==========================================
// INICJALIZACJA BOTA
// ==========================================
// Używamy podstawowych intentów, aby wykluczyć błędy uprawnień
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const CONFIG = {
    COLOR: '#FF4500',
    OWNERS: ['1330125473719783455', '1288839682544762933', '1210915481691623475'],
    PREFIX: '!',
    SERVER_IP: 'xwarsmp.falix.gg',
    VERSION: '2.0.3 STABLE'
};

function updateStatus() {
    try {
        if (client.user) {
            client.user.setActivity(`🎮 IP: ${CONFIG.SERVER_IP}`, { type: ActivityType.Watching });
        }
    } catch (e) {
        console.log("⚠️ Błąd statusu:", e.message);
    }
}

client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`✅ ZALOGOWANO POMYŚLNIE JAKO: ${client.user.tag}`);
    console.log(`🛡️ Bot jest gotowy do pracy!`);
    console.log(`--------------------------------------------------`);
    updateStatus();
    setInterval(updateStatus, 60000);
});

// ==========================================
// PROSTE KOMENDY
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ip') return message.reply(`🎮 IP Serwera: \`${CONFIG.SERVER_IP}\``);
    if (command === 'ping') return message.reply(`🏓 Pong! \`${client.ws.ping}ms\``);
});

// ==========================================
// LOGOWANIE
// ==========================================
console.log("🔍 Sprawdzanie tokena...");
const TOKEN = process.env.MOJ_TOCKEN;

if (!TOKEN) {
    console.error("❌ BRAK TOKENA! Sprawdź Environment Variables na Renderze.");
} else {
    console.log(`⏳ Start logowania (Token: ${TOKEN.substring(0, 10)}...)`);
    
    client.login(TOKEN).catch(err => {
        console.error("❌ BŁĄD PODCZAS LOGOWANIA:");
        console.error("Treść błędu:", err.message);
        
        if (err.message.includes("intents")) {
            console.error("👉 ROZWIĄZANIE: Wejdź na Discord Developer Portal -> Bot -> Przewiń w dół do 'Privileged Gateway Intents' i włącz wszystkie trzy suwaki!");
        }
    });
}

// Zapobieganie wyłączaniu się bota przy drobnych błędach
process.on('uncaughtException', (err) => {
    console.error('🔥 Nieobsłużony błąd:', err);
});
