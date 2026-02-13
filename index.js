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

// --- KONFIGURACJA WŁAŚCICIELI ---
const owners = ['1330125473719783455', '1288839682544762933'];

// --- FUNKCJA STATUSU (SPOŁECZNOŚĆ) ---
function updateStatus() {
  const guild = client.guilds.cache.first();
  if (guild) {
    client.user.setActivity(`Społeczność: ${guild.memberCount}`, { type: ActivityType.Watching });
  }
}

client.once('ready', () => {
  console.log(`✅ SYSTEM XWAR SMP ZAŁADOWANY I GOTOWY`);
  updateStatus();
  setInterval(updateStatus, 300000); // Odświeżanie co 5 minut
});

// --- SYSTEM POWITAŃ ---
client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'witamy' || ch.name === 'powitania');
  if (!channel) return;
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('👋 NOWY GRACZ!')
    .setDescription(`Witaj **${member.user.username}** na XWAR SMP! Przeczytaj koniecznie <#regulamin>!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();
  channel.send({ embeds: [welcomeEmbed] });
  updateStatus();
});

// --- SYSTEM LOGÓW (logi-administracyjne) ---
client.on('messageDelete', message => {
  if (message.author.bot || !message.content) return;
  const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
  if (logChannel) {
    const logEmbed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('🗑️ USUNIĘTO WIADOMOŚĆ')
      .addFields(
        { name: 'Autor:', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: 'Kanał:', value: `${message.channel}`, inline: true },
        { name: 'Treść:', value: message.content }
      )
      .setTimestamp();
    logChannel.send({ embeds: [logEmbed] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1);

  // --- KOMENDA !SAY (TYLKO WŁAŚCICIELE) ---
  if (msg.startsWith('!say ')) {
    if (!owners.includes(message.author.id)) return message.reply("❌ Tylko Właściciel może użyć tej komendy!");
    const text = message.content.slice(5);
    await message.delete();
    
    // Logowanie użycia komendy !say
    const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
    if (logChannel) {
      logChannel.send(`🛠️ **Log:** Właściciel <@${message.author.id}> użył komendy !say o treści: *${text}*`);
    }
    
    return message.channel.send(text);
  }

  // --- KOMENDA !CLEAR (DLA ADMINISTRACJI) ---
  if (msg.startsWith('!clear ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return message.reply("❌ Brak uprawnień!");
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Podaj liczbę 1-100.");
    
    await message.channel.bulkDelete(amount + 1);
    const m = await message.channel.send(`✅ Wyczyściłem ${amount} wiadomości.`);
    
    const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logi-administracyjne');
    if (logChannel) {
      logChannel.send(`🧹 **Log:** <@${message.author.id}> wyczyścił **${amount}** wiadomości na kanale ${message.channel}.`);
    }
    
    setTimeout(() => m.delete(), 3000);
    return;
  }

  // --- KOMENDA !SOCIAL (KLIKALNY LINK) ---
  if (msg === '!social') {
    const socialEmbed = new EmbedBuilder()
      .setColor('#EE82EE')
      .setTitle('📱 NASZ TIKTOK')
      .setDescription('[Kliknij tutaj, aby nas zaobserwować!](https://www.tiktok.com/@kuba06909)')
      .setFooter({ text: 'XWAR SMP - Twoja społeczność!' });
    return message.reply({ embeds: [socialEmbed] });
  }

  // --- KOMENDA !REGULAMIN (LINK DO KANAŁU) ---
  if (msg === '!regulamin') {
    const regEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📜 REGULAMIN SERWERA')
      .setDescription('Pełną listę zasad znajdziesz tutaj: <#regulamin>')
      .addFields({ name: 'NAJWAŻNIEJSZE:', value: '• Zakaz czitowania\n• Zakaz niszczenia mienia\n• Kultura osobista' });
    return message.reply({ embeds: [regEmbed] });
  }

  // --- KOMENDA !IP ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 DANE SERWERA')
      .addFields(
        { name: '📍 IP:', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT:', value: '`34899`', inline: true }
      );
    return message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !SERWER_INFO (STATYSTYKI) ---
  if (msg === '!serwer_info') {
    const infoEmbed = new EmbedBuilder()
      .setColor('#00AAFF')
      .setTitle(`📊 INFO: ${message.guild.name}`)
      .setThumbnail(message.guild.iconURL())
      .addFields(
        { name: '👥 Liczba osób:', value: `${message.guild.memberCount}`, inline: true },
        { name: '👑 Właściciel:', value: `<@${message.guild.ownerId}>`, inline: true },
        { name: '🌍 Region:', value: `Polska`, inline: true }
      )
      .setTimestamp();
    return message.reply({ embeds: [infoEmbed] });
  }

  // --- KOMENDA !POMOC (PIONOWE MENU) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('✨ CENTRUM POMOCY')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '📍 INFORMACJE', value: '`!ip`, `!dc`, `!regulamin`, `!social`' },
        { name: '🎮 ZABAWA', value: '`!kostka`, `!moneta`, `!avatar`' },
        { name: '🛠️ DLA EKIPY', value: '`!ogloszenie`, `!say`, `!clear`, `!serwer_info`' }
      )
      .setFooter({ text: 'XWAR SMP - Najlepszy Survival!' });
    return message.reply({ embeds: [helpEmbed] });
  }

  // --- SZYBKIE KOMENDY ---
  if (msg === '!dc') return message.reply('🔗 Zaproś znajomych: https://discord.gg/awEJcWmM');
  if (msg === '!ping') return message.reply(`🏓 Pong! **${client.ws.ping}ms**`);
  if (msg === '!kostka') return message.reply(`🎲 Rzut kostką... Wynik: **${Math.floor(Math.random() * 6) + 1}**`);
  if (msg === '!moneta') return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  if (msg === '!avatar') return message.reply(message.author.displayAvatarURL({ size: 1024 }));
});

client.login(process.env.DISCORD_TOKEN);
