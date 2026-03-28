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
// SERWER WWW (WYMAGANY PRZEZ RENDER.COM)
// ==========================================
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("XWAR SMP STATUS: OK - BOT IS RUNNING");
    res.end();
}).listen(process.env.PORT || 10000, () => {
    console.log("🌐 Serwer WWW dla Rendera nasłuchuje na porcie 10000");
});

// ==========================================
// KONFIGURACJA I INTENTY
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Zarządzanie serwerem
        GatewayIntentBits.GuildMessages,    // Czytanie wiadomości
        GatewayIntentBits.MessageContent,   // Czytanie treści (WYMAGA WŁĄCZENIA W PANELU!)
        GatewayIntentBits.GuildMembers      // Informacje o członkach
    ]
});

const CONFIG = {
    COLOR: '#FF4500', // Pomarańczowy kolor XWAR
    OWNERS: ['1330125473719783455', '1288839682544762933', '1210915481691623475'],
    PREFIX: '!',
    SERVER_IP: 'xwarsmp.falix.gg',
    VERSION: '2.0.4 PRODUCTION'
};

// ==========================================
// ZDARZENIE: GOTOWOŚĆ BOTA
// ==========================================
client.once('ready', () => {
    console.log(`--------------------------------------------------`);
    console.log(`✅ POŁĄCZONO Z DISCORDEM!`);
    console.log(`🤖 Zalogowano jako: ${client.user.tag}`);
    console.log(`⚙️ Wersja bota: ${CONFIG.VERSION}`);
    console.log(`--------------------------------------------------`);
    
    // Ustawienie statusu bota
    client.user.setActivity(`🎮 IP: ${CONFIG.SERVER_IP}`, { type: ActivityType.Watching });
});

// ==========================================
// KOMENDY (OBSŁUGA WIADOMOŚCI)
// ==========================================
client.on('messageCreate', async (message) => {
    // Ignoruj boty i wiadomości prywatne
    if (message.author.bot || !message.guild) return;

    // Sprawdź czy wiadomość zaczyna się od prefixu
    if (!message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Komenda !pomoc
    if (command === 'pomoc') {
        const embed = new EmbedBuilder()
            .setColor(CONFIG.COLOR)
            .setTitle('✨ PANEL POMOCY XWAR SMP')
            .addFields(
                { name: '🎮 Serwer', value: '`!ip` - Adres serwera\n`!ping` - Opóźnienie bota', inline: true },
                { name: '🔗 Inne', value: '`!dc` - Link do Discorda\n`!social` - Nasze media', inline: true }
            )
            .setFooter({ text: `Wersja: ${CONFIG.VERSION}` })
            .setTimestamp();
        
        return message.reply({ embeds: [embed] });
    }

    // Komenda !ip
    if (command === 'ip') {
        return message.reply(`🎮 Adres IP do wejścia na serwer: **\`${CONFIG.SERVER_IP}\`**`);
    }

    // Komenda !ping
    if (command === 'ping') {
        return message.reply(`🏓 Pong! Opóźnienie bota wynosi: **\`${client.ws.ping}ms\`**`);
    }

    // Komenda !dc
    if (command === 'dc') {
        return message.reply('🔗 Oficjalny link do naszego Discorda: https://discord.gg/TWOJ-LINK');
    }
});

// ==========================================
// SYSTEM LOGOWANIA I BŁĘDÓW
// ==========================================
console.log("🔍 Inicjalizacja procesu logowania...");

const TOKEN = process.env.MOJ_TOCKEN;

if (!TOKEN) {
    console.error("❌ BŁĄD: Zmienna MOJ_TOCKEN jest pusta!");
    console.log("👉 Wejdź na Render -> Environment i upewnij się, że klucz MOJ_TOCKEN istnieje.");
} else {
    console.log(`⏳ Łączenie z API Discord (Token: ${TOKEN.substring(0, 10)}...)`);
    
    client.login(TOKEN).catch(err => {
        console.error("❌ BŁĄD LOGOWANIA:");
        console.error(err.message);
        
        if (err.message.includes("Privileged intents")) {
            console.log("\n🆘 ROZWIĄZANIE:");
            console.log("1. Wejdź na: https://discord.com/developers/applications");
            console.log("2. Wybierz bota -> Zakładka 'Bot'");
            console.log("3. Włącz: 'Presence Intent', 'Server Members Intent' oraz 'Message Content Intent'");
            console.log("4. Kliknij 'Save Changes' i zrestartuj bota na Renderze.");
        }
    });
}

// Globalne przechwytywanie błędów (zapobiega crashowaniu)
process.on('uncaughtException', (err) => {
    console.error('💥 Wykryto poważny błąd:', err.message);
});
