Masz rację, mój błąd! Skoro wyszła już wersja 1.21.11, to musimy to natychmiast poprawić w kodzie, żeby gracze nie próbowali wchodzić na złej wersji.

Oto zaktualizowany kod z poprawioną wersją oraz wszystkimi ładnymi ramkami (Embedami).

Kod do wklejenia w index.js:
JavaScript
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

  // --- KOMENDA !POMOC ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Witaj! Oto co potrafię zrobić na serwerze:')
      .addFields(
        { name: '📋 Informacje', value: '`!ip` - Dane serwera Minecraft\n`!dc` - Link do Discorda\n`!regulamin` - Nasze zasady' },
        { name: '🎲 Zabawa', value: '`!kostka` - Rzut kostką\n`!moneta` - Orzeł czy reszka' },
        { name: '🛠️ Narzędzia', value: '`!autor` - Kto stworzył bota\n`!ping` - Opóźnienie bota' },
        { name: '📢 Administracja', value: '`!ogloszenie [tekst]` - Tworzy ramkę ogłoszenia' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Wersja 1.21.11) ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 DOŁĄCZ DO XWAR SMP!')
      .setDescription('Czekamy na Ciebie w świecie Minecraft!')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true },
        { name: '🛠️ WERSJA', value: '`1.21.11`', inline: false }
      )
      .setFooter({ text: 'Zasuwaj budować bazę! 🔥' });

    message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !AUTOR ---
  if (msg === '!autor') {
    const authorEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('👑 TWÓRCA BOTA')
      .setDescription('Właścicielem i mózgiem operacji jest **Sigiemka**.')
      .setFooter({ text: 'Pełen szacun! 🫡' });

    message.reply({ embeds: [authorEmbed] });
  }

  // --- RESZTA FUNKCJI ---
  if (msg === '!dc' || msg === '!discord') {
    message.reply('🔗 **Oficjalne zaproszenie:** https://discord.gg/awEJcWmM');
  }

  if (msg === '!regulamin') {
    message.reply('📜 **REGULAMIN:** Nie czituj, nie kradnij, szanuj innych i zakaz reklam!');
  }

  if (msg === '!ping') {
    message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  }

  if (msg === '!kostka') {
    message.reply(`🎲 Wypadło: **${Math.floor(Math.random() * 6) + 1}**`);
  }

  if (msg === '!moneta') {
    message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  }

  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#FF0000').setTitle('📢 OGŁOSZENIE').setDescription(text).setTimestamp();
    message.channel.send({ embeds: [ann] });
    message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
