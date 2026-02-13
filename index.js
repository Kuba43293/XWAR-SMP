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

  // --- KOMENDA !SAY ---
  if (msg.startsWith('!say ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return message.reply("❌ Nie masz uprawnień!");
    }
    const sayMessage = message.content.slice(5);
    await message.delete();
    return message.channel.send(sayMessage);
  }

  // --- KOMENDA !REGULAMIN (Z poprawionym linkowaniem kanału) ---
  if (msg === '!regulamin') {
    const regChannel = message.guild.channels.cache.find(ch => ch.name === 'regulamin');
    const channelMention = regChannel ? `<#${regChannel.id}>` : '#regulamin';

    const regEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
      .setDescription(`Aby zapoznać się z pełną treścią zasad, odwiedź kanał ${channelMention}`)
      .addFields(
        { name: '🚀 Główne zasady:', value: '• Zakaz czitowania i używania wspomagaczy\n• Zakaz griefowania i niszczenia baz\n• Szanuj innych graczy i administrację\n• Zakaz reklamowania innych serwerów' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() });

    return message.reply({ embeds: [regEmbed] });
  }

  // --- KOMENDA !SOCIAL (Z KLIKALNYM LINKIEM) ---
  if (msg === '!social' || msg === '!media') {
    const socialEmbed = new EmbedBuilder()
      .setColor('#EE82EE')
      .setTitle('📱 NASZE MEDIA SPOŁECZNOŚCIOWE')
      .setDescription('Śledź nas, aby być na bieżąco!')
      .addFields(
        { name: 'TikTok', value: '[Kliknij tutaj, aby zaobserwować!](https://www.tiktok.com/@kuba06909)', inline: true }
      )
      .setFooter({ text: 'Dzięki za wsparcie! ❤️' });
    return message.reply({ embeds: [socialEmbed] });
  }

  // --- KOMENDA !IP (Bez zbędnych spacji) ---
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

  // --- KOMENDA !POMOC (Naprawiona literówka Twoja) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '📍 Główne informacje', value: '> **!ip**, **!dc**, **!regulamin**, **!social**' },
        { name: '🎮 Gry i Fun', value: '> **!kostka**, **!moneta**, **!losuj**, **!avatar**' },
        { name: '📊 Admin', value: '> **!ogloszenie**, **!say**, **!serwer_info**' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- RESZTA KOMEND ---
  if (msg === '!serwer_info') {
    const { guild } = message;
    const infoEmbed = new EmbedBuilder().setColor('#0099ff').setTitle(`📊 INFO: ${guild.name}`).addFields(
        { name: 'Członkowie:', value: `${guild.memberCount}`, inline: true },
        { name: 'Właściciel:', value: `<@${guild.ownerId}>`, inline: true }
    );
    return message.reply({ embeds: [infoEmbed] });
  }

  if (msg === '!dc') return message.reply('🔗 https://discord.gg/awEJcWmM');
  if (msg === '!ping') return message.reply(`🏓 Pong! **${Math.round(client.ws.ping)}ms**`);

  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder().setColor('#FF0000').setTitle('📢 OGŁOSZENIE').setDescription(text);
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
