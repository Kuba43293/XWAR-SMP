require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Funkcja aktualizująca status na "Społeczność: [liczba]"
function updateStatus() {
  const guild = client.guilds.cache.first();
  if (guild) {
    client.user.setActivity(`Społeczność: ${guild.memberCount}`, { 
      type: ActivityType.Watching 
    });
  }
}

client.once('ready', () => {
  console.log(`Bot ${client.user.tag} jest online!`);
  updateStatus();
  setInterval(updateStatus, 300000); 
});

// SYSTEM POWITAŃ
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('👋 NOWY GRACZ NA POKŁADZIE!')
    .setDescription(`Siema **${member.user.username}**! Witaj na serwerze **XWAR SMP**. \n\nKoniecznie sprawdź \`!regulamin\` i baw się dobrze! ⚔️`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  channel.send({ embeds: [welcomeEmbed] });
  updateStatus(); 
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();

  // --- KOMENDA !SAY (Dla Ciebie) ---
  if (msg.startsWith('!say ')) {
    // Sprawdza, czy osoba ma uprawnienia do zarządzania wiadomościami
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return message.reply("❌ Nie masz uprawnień do używania tej komendy!");
    }
    const sayMessage = message.content.slice(5);
    await message.delete(); // Usuwa Twoją wiadomość !say
    return message.channel.send(sayMessage); // Wysyła sam tekst przez bota
  }

  // --- POPRAWIONE MENU !POMOC ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Witaj! Oto lista wszystkich funkcji bota:')
      .addFields(
        { name: '📍 Główne informacje', value: '> **!ip** - Dane serwera\n> **!dc** - Link Discord\n> **!regulamin** - Zasady\n> **!social** - Nasze media' },
        { name: '🎮 Gry i Fun', value: '> **!kostka** - Rzut kostką\n> **!moneta** - Orzeł/Reszka\n> **!losuj [a] [b]** - Wybór opcji\n> **!avatar** - Twój awatar' },
        { name: '📊 Statystyki i Admin', value: '> **!serwer_info** - Dane o DC\n> **!ping** - Status bota\n> **!ogloszenie [tekst]** - Robi ogłoszenie\n> **!say [tekst]** - Bot mówi za Ciebie' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Wyrównana) ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 SERWER XWAR SMP')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌PORT', value: '`34899`', inline: true },
        { name: '🛠️ WERSJA', value: '`1.21.11`', inline: false }
      )
      .setFooter({ text: 'Dołącz do gry! 🔥' });

    return message.reply({ embeds: [ipEmbed] });
  }

  // --- POZOSTAŁE KOMENDY ---
  if (msg === '!serwer_info') {
    const { guild } = message;
    const infoEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 INFORMACJE O ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Data powstania:', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Właściciel:', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Liczba członków:', value: `${guild.memberCount}`, inline: true }
      );
    return message.reply({ embeds: [infoEmbed] });
  }

  if (msg === '!avatar') {
    const avatarEmbed = new EmbedBuilder()
      .setColor('#ffffff')
      .setTitle(`Avatar użytkownika ${message.author.username}`)
      .setImage(message.author.displayAvatarURL({ size: 1024 }));
    return message.reply({ embeds: [avatarEmbed] });
  }

  if (msg.startsWith('!losuj ')) {
    const choices = message.content.slice(7).split(' ');
    if (choices.length < 2) return message.reply('❌ Podaj dwie opcje po spacji, np. `!losuj tak nie`');
    const picked = choices[Math.floor(Math.random() * choices.length)];
    return message.reply(`🤔 Wybieram: **${picked}**!`);
  }

  if (msg === '!social') return message.reply('📱 Znajdziesz nas na TikToku i YouTube!');
  if (msg === '!dc') return message.reply('🔗 https://discord.gg/awEJcWmM');
  if (msg === '!autor') return message.reply('👑 Twórcą bota jest **Sigiemka**.');
  if (msg === '!regulamin') return message.reply('📜 Nie czituj i szanuj innych graczy!');
  if (msg === '!ping') return message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  if (msg === '!kostka') return message.reply(`🎲 Wypadło: **${Math.floor(Math.random() * 6) + 1}**`);
  if (msg === '!moneta') return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);

  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#FF0000').setTitle('📢 OGŁOSZENIE').setDescription(text).setTimestamp();
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
