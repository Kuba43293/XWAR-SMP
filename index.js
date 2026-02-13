require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}! Bot XWAR SMP jest ONLINE.`);
  client.user.setActivity('na XWAR SMP', { type: ActivityType.Playing });
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // Komenda !hej
  if (msg === '!hej') {
    message.reply('Siemanko! Tu bot serwera **XWAR SMP**. ⚔️');
  }

  // Komenda !ip / !serwer
  if (msg === '!ip' || msg === '!serwer') {
    message.reply('🎮 **ADRES SERWERA XWAR SMP** 🎮\n\n🌍 IP: `Xwarsmp.aternos.me` \n🔌 Port: `34899` \n\nZasuwaj do gry! 🔥');
  }

  // Komenda !regulamin
  if (msg === '!regulamin' || msg === '!zasady') {
    message.reply('📜 **REGULAMIN XWAR SMP** 📜\n1. Nie czituj (Ban permanentny).\n2. Nie kradnij i nie griefuj.\n3. Szanuj innych graczy.\n4. Zakaz reklamowania innych serwerów.\n5. Baw się dobrze!');
  }

  // Komenda !dc
  if (msg === '!dc' || msg === '!discord') {
    message.reply('🔗 **LINK DO DISCORDA** 🔗\nZaproś znajomych: https://discord.gg/awEJcWmM');
  }

  // Komenda !autor
  if (msg === '!autor' || msg === '!tworca') {
    message.reply('👑 Autorem i właścicielem tego bota jest **Sigiemka**. Dobra robota!');
  }

  // NOWA Komenda !ping
  if (msg === '!ping') {
    message.reply(`🏓 Pong! Opóźnienie bota to: **${Math.round(client.ws.ping)}ms**.`);
  }

  // NOWA Komenda !kostka
  if (msg === '!kostka') {
    const wynik = Math.floor(Math.random() * 6) + 1;
    message.reply(`🎲 Rzuciłeś kostką i wypadło: **${wynik}**!`);
  }

  // NOWA Komenda !moneta
  if (msg === '!moneta') {
    const wynik = Math.random() < 0.5 ? 'Orzeł' : 'Reszka';
    message.reply(`🪙 Rzuciłeś monetą i wypadło: **${wynik}**!`);
  }

  // Komenda !pomoc (zaktualizowana)
  if (msg === '!pomoc') {
    message.reply('🤖 **LISTA KOMEND BOTA XWAR SMP** 🤖\n\n`!ip`, `!regulamin`, `!dc`, `!autor`\n`!ping` - Sprawdź lagi bota\n`!kostka`, `!moneta` - Zabawy losowe\n`!hej` - Przywitanie');
  }
});

client.login(process.env.DISCORD_TOKEN);
