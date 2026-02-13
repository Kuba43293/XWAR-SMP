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

  // Komenda !hej
  if (message.content === '!hej') {
    message.reply('Siemanko! Tu bot serwera **XWAR SMP**. Wszystko działa! ⚔️');
  }

  // Komenda !ip oraz !serwer
  if (message.content === '!ip' || message.content === '!serwer') {
    message.reply('🎮 **ADRES SERWERA XWAR SMP** 🎮\n\n🌍 IP: `Xwarsmp.aternos.me` \n🔌 Port: `34899` \n\nZasuwaj do gry! 🔥');
  }
});

client.login(process.env.DISCORD_TOKEN);
