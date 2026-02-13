require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}!`);
  client.user.setActivity('na XWAR SMP', { type: ActivityType.Playing });
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // --- ELEGANCKA KOMENDA !POMOC ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Witaj! Oto lista wszystkich funkcji, które pomogą Ci na serwerze:')
      .addFields(
        { name: '📍 Główne informacje', value: '`!ip` - Dane serwera\n`!dc` - Link Discord\n`!regulamin` - Zasady' },
        { name: '🎮 Gry i Zabawa', value: '`!kostka` - Rzut kostką\n`!moneta` - Orzeł/Reszka\n`!ping` - Opóźnienie bota' },
        { name: '👑 Administracja', value: '`!autor` - Twórca bota\n`!ogloszenie [tekst]` - Robi ogłoszenie' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Wersja 1.21.11) ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 DOŁĄCZ DO XWAR SMP!')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true },
        { name: '🛠️ WERSJA', value: '`1.21.11`', inline: false }
      )
      .setFooter({ text: 'Zasuwaj budować bazę! 🔥' });

    return message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !DC ---
  if (msg === '!dc' || msg === '!discord') {
    return message.reply('🔗 **Nasz Discord:** https://discord.gg/awEJcWmM');
  }

  // --- KOMENDA !AUTOR ---
  if (msg === '!autor') {
    const authorEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('👑 TWÓRCA BOTA')
      .setDescription('Właścicielem bota jest **Sigiemka**.')
      .setFooter({ text: 'Pełen szacun! 🫡' });
    return message.reply({ embeds: [authorEmbed] });
  }

  // --- KOMENDA !REGULAMIN ---
  if (msg === '!regulamin') {
    return message.reply('📜 **Zasady:** Nie czituj, nie kradnij, szanuj innych i baw się dobrze!');
  }

  // --- KOMENDA !PING ---
  if (msg === '!ping') {
    return message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  }

  // --- ZABAWY ---
  if (msg === '!kostka') {
    return message.reply(`🎲 Wynik: **${Math.floor(Math.random() * 6) + 1}**`);
  }
  if (msg === '!moneta') {
    return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  }

  // --- OGŁOSZENIE ---
  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#FF0000').setTitle('📢 OGŁOSZENIE').setDescription(text).setTimestamp();
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
