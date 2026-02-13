require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}! Bot XWAR SMP jest ONLINE.`);
});

client.on('messageCreate', message => {
  if (message.content === '!hej') {
    message.reply('Siemanko! Tu bot serwera **XWAR SMP**. Wszystko działa!');
  }
});

client.login(process.env.MTQ3MTU0MjA1NDIxODYyOTE0MA.GVBq_n.dSqkufIsoLdpQzVW9p0mLiQyg1BF3aGMkmKu7k);
