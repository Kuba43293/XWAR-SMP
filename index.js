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
// SERWER WWW (MUSI BYĆ NA POCZĄTKU DLA RENDERA)
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
    VERSION: '2.0.2 FORCE-LOG'
};

const xpData = new Map();

// ==========================================
// STATUS BOTA
// ==========================================
function updateStatus() {
    try {
        const guild = client.guilds.cache.first();
        const count = guild ? guild.memberCount : "??";
        client.user.setActivity(`🎮 IP: ${CONFIG.SERVER_IP} | 👥 ${count}`, { type: ActivityType.Watching });
    } catch (e) {
        console.log("⚠️ Błąd aktualizacji statusu:", e.message);
    }
}

client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`✅ DISCORD: POŁĄCZONO POMYŚLNIE`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`⚙️ Wersja: ${CONFIG.VERSION}`);
    console.log(`--------------------------------------------------`);
    updateStatus();
    setInterval(updateStatus, 60000);
});

// ==========================================
// KOMENDY (UPROSZCZONE DLA TESTU)
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

    if (command === 'ip') return message.reply(`🎮 Adres IP serwera: \`${CONFIG.SERVER_IP}\``);
    if (command === 'ping') return message.reply(`🏓 Pong! Latencja: \`${client.ws.ping}ms\``);
});

// ==========================================
// START I LOGOWANIE (NAJWAŻNIEJSZA SEKCJA)
// ==========================================
console.log("🔍 Sprawdzanie konfiguracji środowiska...");

// Próbujemy pobrać token z dwóch najczęstszych nazw
const TOKEN = process.env.MOJ_TOCKEN || process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("❌ KRYTYCZNY BŁĄD: Nie znaleziono tokena bota!");
    console.error("Upewnij się, że w Render -> Environment dodałeś MOJ_TOCKEN.");
} else {
    console.log(`⏳ Próba połączenia z Discordem (Token zaczyna się od: ${TOKEN.substring(0, 5)}... )`);
    
    client.login(TOKEN).then(() => {
        console.log("📡 Metoda login() zakończona sukcesem.");
    }).catch(err => {
        console.error("❌ BŁĄD LOGOWANIA DO DISCORDA:");
        if (err.message.includes("Privileged intents")) {
            console.error("PRZYCZYNA: Nie włączyłeś 'Intents' w Discord Developer Portal!");
        } else if (err.message.includes("An invalid token")) {
            console.error("PRZYCZYNA: Token jest nieprawidłowy (może błędnie skopiowany?)");
        } else {
            console.error(err.message);
        }
    });
}

// Globalna obsługa błędów, żeby bot nie padał po cichu
process.on('unhandledRejection', (reason, promise) => {
    console.error('--- NIEPRZEWIDZIANY BŁĄD (REJECTION) ---');
    console.error(reason);
});
