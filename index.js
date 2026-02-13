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

// Funkcja aktualizująca status na "Ludzi na DC: [liczba]"
function updateStatus() {
  const guild = client.guilds.cache.first();
  if (guild) {
    client.user.setActivity(`Ludzi na DC: ${guild.memberCount}`, { 
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

  // --- BLOKADA KOMENDY !SAY (Tylko dla osób z uprawnieniami) ---
  if (msg.startsWith('!say ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Nie masz uprawnień, aby używać bota do mówienia!");
    }
    const sayMessage = message.content.slice(5);
    await message.delete();
    return message.channel.send(sayMessage);
  }

  // --- BLOKADA KOMENDY !OGLOSZENIE (Tylko dla osób z uprawnieniami) ---
  if (msg.startsWith('!ogloszenie ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Ta komenda jest tylko dla Administracji!");
    }
    const text = message.content.slice(12);
    const ann = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📢 OGŁOSZENIE')
      .setDescription(text)
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!' }) //
      .setTimestamp();
    
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }

  // --- MENU !POMOC (Pionowy układ + szare ramki) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { 
          name: '📍 Główne informacje', 
          value: '`!ip` - Dane serwera\n`!dc` - Link Discord\n`!regulamin` - Zasady\n`!social` - Nasze media' 
        },
        { 
          name: '🎮 Gry i Fun', 
          value: '`!kostka` - Rzut kostką\n`!moneta` - Orzeł/Reszka\n`!losuj [a] [b]` - Wybór opcji\n`!avatar` - Twój awatar' 
        },
        { 
          name: '📊 Statystyki i Admin', 
          value: '`!serwer_info` - Dane o DC\n`!ping` - Status bota\n`!ogloszenie [tekst]` - Robi ogłoszenie\n`!say [tekst]` - Bot mówi za Ciebie' 
        }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Wyrównana bez spacji) ---
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

  // --- KOMENDA !SOCIAL (Z klikalnym linkiem) ---
  if (msg === '!social') {
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

  // --- KOMENDA !REGULAMIN (Naprawiony link kanału) ---
  if (msg === '!regulamin') {
    const regChannel = message.guild.channels.cache.find(ch => ch.name === 'regulamin');
    const channelMention = regChannel ? `<#${regChannel.id}>` : '#regulamin';

    const regEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
      .setDescription(`Aby zapoznać się z pełną treścią zasad, odwiedź kanał ${channelMention}`)
      .addFields(
        { name: '🚀 Główne zasady:', value: '• Zakaz czitowania\n• Zakaz griefowania i niszczenia baz\n• Szanuj innych graczy i administrację' }
      )
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!' });

    return message.reply({ embeds: [regEmbed] });
  }

  // --- POZOSTAŁE KOMENDY ---
  if (msg === '!dc') return message.reply('🔗 https://discord.gg/awEJcWmM');
  if (msg === '!ping') return message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  if (msg === '!kostka') return message.reply(`🎲 Wypadło: **${Math.floor(Math.random() * 6) + 1}**`);
  if (msg === '!moneta') return message.reply(`🪙 Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  
  if (msg === '!serwer_info') {
    return message.reply(`📊 Na serwerze **${message.guild.name}** jest obecnie **${message.guild.memberCount}** osób.`);
  }

  if (msg === '!avatar') {
    const avatarEmbed = new EmbedBuilder().setColor('#ffffff').setTitle(`Avatar: ${message.author.username}`).setImage(message.author.displayAvatarURL({ size: 1024 }));
    return message.reply({ embeds: [avatarEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
