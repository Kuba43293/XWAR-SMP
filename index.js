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

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // --- KOMENDA !POMOC (Wersja Premium) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700') // Złoty kolor paska
      .setTitle('🤖 CENTRUM POMOCY XWAR SMP')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Oto lista wszystkich dostępnych funkcji bota:')
      .addFields(
        { name: '📍 Główne informacje', value: '`!ip` - Dane serwera\n`!dc` - Link Discord\n`!regulamin` - Zasady' },
        { name: '🎮 Rozrywka', value: '`!kostka` - Rzut kostką\n`!moneta` - Orzeł/Reszka\n`!ping` - Status bota' },
        { name: '👑 Administracja', value: '`!autor` - Twórca bota\n`!ogloszenie [tekst]` - Robi ogłoszenie' }
      )
      .setFooter({ text: 'XWAR SMP - Najlepszy serwer survival!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Ładna ramka) ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 DOŁĄCZ DO GRY NA XWAR SMP')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true }
      )
      .setImage('https://i.imgur.com/8N4R7yS.png') // Możesz tu wstawić link do screena z gry
      .setFooter({ text: 'Czekamy na Ciebie!' });

    message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !AUTOR (Z Twoim zdjęciem) ---
  if (msg === '!autor') {
    const authorEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('👑 TWÓRCA BOTA')
      .setDescription('Właścicielem i pomysłodawcą bota jest **Sigiemka**.')
      .setThumbnail(message.guild.ownerId === message.author.id ? message.author.displayAvatarURL() : null)
      .setFooter({ text: 'Dobra robota, Szefie!' });

    message.reply({ embeds: [authorEmbed] });
  }

  // --- RESZTA KOMEND ---
  if (msg === '!dc' || msg === '!discord') {
    message.reply('🔗 **Nasz Discord:** https://discord.gg/awEJcWmM');
  }

  if (msg === '!regulamin') {
    message.reply('📜 **Zasady:** Nie czituj, nie kradnij, szanuj innych i baw się dobrze!');
  }

  if (msg === '!kostka') {
    message.reply(`🎲 Wynik: **${Math.floor(Math.random() * 6) + 1}**`);
  }

  if (msg === '!moneta') {
    message.reply(`🪙 Wypadło: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  }

  // Komenda do ogłoszeń
  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#ff0000').setTitle('📢 OGŁOSZENIE').setDescription(text).setTimestamp();
    message.channel.send({ embeds: [ann] });
    message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
