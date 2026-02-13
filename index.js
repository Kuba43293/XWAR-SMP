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
  // Ustawia status bota: "W grze: na XWAR SMP"
  client.user.setActivity('na XWAR SMP', { type: ActivityType.Playing });
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // Komenda !hej
  if (msg === '!hej') {
    message.reply('Siemanko! Tu bot serwera **XWAR SMP**. Wszystko działa! ⚔️');
  }

  // Komenda !ip / !serwer
  if (msg === '!ip' || msg === '!serwer') {
    message.reply('🎮 **ADRES SERWERA XWAR SMP** 🎮\n\n🌍 IP: `Xwarsmp.aternos.me` \n🔌 Port: `34899` \n\nZasuwaj do gry! 🔥');
  }

  // Komenda !regulamin
  if (msg === '!regulamin' || msg === '!zasady') {
    message.reply('📜 **REGULAMIN XWAR SMP** 📜\n1. Nie czituj (Ban permanentny).\n2. Nie kradnij i nie griefuj.\n3. Szanuj innych graczy.\n4. Zakaz reklamowania innych serwerów.\n5. Baw się dobrze! \n\nPełny regulamin znajdziesz na odpowiednim kanale.');
  }

  // Komenda !dc z Twoim linkiem
  if (msg === '!dc' || msg === '!discord') {
    message.reply('🔗 **LINK DO DISCORDA** 🔗\nZaproś znajomych: https://discord.gg/awEJcWmM');
  }

  // Komenda !pomoc - pokazuje wszystkie dostępne komendy
  if (msg === '!pomoc') {
    message.reply('🤖 **LISTA KOMEND BOTA XWAR SMP** 🤖\n\n`!ip` - Adres i port serwera\n`!regulamin` - Zasady serwera\n`!dc` - Link do zaproszenia znajomych\n`!hej` - Przywitanie z botem');
  }
});

client.login(process.env.DISCORD_TOKEN);
