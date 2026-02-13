require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // Potrzebne, żeby liczyć osoby
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Funkcja aktualizująca liczbę osób na DC
function updateDiscordStatus() {
  // Pobieramy pierwszy serwer, na którym jest bot
  const guild = client.guilds.cache.first();
  if (guild) {
    const memberCount = guild.memberCount;
    client.user.setActivity(`Ludzi na DC: ${memberCount}`, { 
      type: ActivityType.Watching 
    });
  }
}

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}!`);
  
  // Aktualizuj status od razu i potem co 10 minut
  updateDiscordStatus();
  setInterval(updateDiscordStatus, 600000); 
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // --- KOMENDA !POMOC ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '📍 Info', value: '`!ip`, `!dc`, `!regulamin`' },
        { name: '🎮 Fun', value: '`!kostka`, `!moneta`, `!ping`' },
        { name: '👑 Inne', value: '`!autor`, `!ogloszenie [tekst]`' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!' })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 DOŁĄCZ DO XWAR SMP!')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true },
        { name: '🛠️ WERSJA', value: '`1.21.11`', inline: false }
      )
      .setFooter({ text: 'Zasuwaj do gry! 🔥' });

    return message.reply({ embeds: [ipEmbed] });
  }

  // Reszta komend
  if (msg === '!dc') return message.reply('🔗 https://discord.gg/awEJcWmM');
  if (msg === '!autor') return message.reply('👑 Twórcą bota jest **Sigiemka**.');
  if (msg === '!regulamin') return message.reply('📜 Nie czituj, nie kradnij, szanuj innych!');
  
  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#FF0000').setTitle('📢 OGŁOSZENIE').setDescription(text).setTimestamp();
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
