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

// --- FUNKCJA STATUSU (SPOŁECZNOŚĆ) ---
function updateStatus() {
  const guild = client.guilds.cache.first();
  if (guild) {
    // Ustawia status na "Ogląda: Społeczność: X"
    client.user.setActivity(`Społeczność: ${guild.memberCount}`, { 
      type: ActivityType.Watching 
    });
  }
}

client.once('ready', () => {
  console.log(`✅ Bot ${client.user.tag} jest gotowy!`);
  updateStatus();
  setInterval(updateStatus, 300000); // Odświeżaj co 5 minut
});

// --- SYSTEM POWITAŃ ---
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

// --- OBSŁUGA KOMEND ---
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();

  // --- KOMENDA !SAY (TYLKO DLA WŁAŚCICIELI) ---
  if (msg.startsWith('!say ')) {
    // Twoje ID oraz ID drugiego właściciela
    const owners = ['1330125473719783455', '1288839682544762933']; 
    
    if (!owners.includes(message.author.id)) {
      return message.reply("❌ Tylko Właściciele mogą używać tej komendy!");
    }
    
    const sayMessage = message.content.slice(5);
    await message.delete();
    return message.channel.send(sayMessage);
  }

  // --- KOMENDA !OGLOSZENIE (DLA ADMINISTRACJI) ---
  if (msg.startsWith('!ogloszenie ')) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ Ta komenda jest tylko dla Administracji i Moderatorów!");
    }
    
    const text = message.content.slice(12);
    const ann = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📢 OGŁOSZENIE')
      .setDescription(text)
      .setFooter({ text: 'XWAR SMP - Twoja kraina survivalu!' })
      .setTimestamp();
      
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }

  // --- MENU !POMOC (PIONOWY UKŁAD + SZARE RAMKI) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { 
          name: '📍 Główne informacje', 
          value: '`!ip` - Dane serwerowe\n`!dc` - Link Discord\n`!regulamin` - Zasady gry\n`!social` - Nasze media' 
        },
        { 
          name: '🎮 Gry i Fun', 
          value: '`!kostka` - Rzut kostką\n`!moneta` - Orzeł/Reszka\n`!avatar` - Twój profilowy' 
        },
        { 
          name: '📊 Statystyki i Admin', 
          value: '`!serwer_info` - Info o DC\n`!ping` - Status bota\n`!ogloszenie [tekst]` - Robi ogłoszenie\n`!say [tekst]` - Bot mówi za Ciebie' 
        }
      )
      .setFooter({ text: 'XWAR SMP - Survival czeka!', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 SERWER XWAR SMP')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true }
      )
      .setFooter({ text: 'Dołącz do gry! 🔥' });
    return message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !SOCIAL ---
  if (msg === '!social') {
    const socialEmbed = new EmbedBuilder()
      .setColor('#EE82EE')
      .setTitle('📱 NASZ TIKTOK')
      .setDescription('[Kliknij tutaj, aby nas zaobserwować!](https://www.tiktok.com/@kuba06909)')
      .setFooter({ text: 'Dzięki za wsparcie! ❤️' });
    return message.reply({ embeds: [socialEmbed] });
  }

  // --- KOMENDA !REGULAMIN ---
  if (msg === '!regulamin') {
    const regEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📜 REGULAMIN SERWERA XWAR SMP')
      .setDescription('Zasady są proste: \n1. Zakaz czitowania \n2. Zakaz griefowania \n3. Szacunek do graczy.')
      .setFooter({ text: 'Łamanie zasad grozi banem!' });
    return message.reply({ embeds: [regEmbed] });
  }

  // --- KOMENDY FUN I INFO ---
  if (msg === '!dc') return message.reply('🔗 Link do Discorda: https://discord.gg/awEJcWmM');
  if (msg === '!ping') return message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  if (msg === '!kostka') return message.reply(`🎲 Rzut kostką... Wypadło: **${Math.floor(Math.random() * 6) + 1}**`);
  if (msg === '!moneta') return message.reply(`🪙 Rzut monetą... Wynik: **${Math.random() < 0.5 ? 'Orzeł' : 'Reszka'}**`);
  if (msg === '!avatar') {
    const avEmbed = new EmbedBuilder()
      .setColor('#ffffff')
      .setTitle(`Avatar użytkownika ${message.author.username}`)
      .setImage(message.author.displayAvatarURL({ size: 1024 }));
    return message.reply({ embeds: [avEmbed] });
  }
  if (msg === '!serwer_info') {
    const infoEmbed = new EmbedBuilder()
      .setColor('#00AAFF')
      .setTitle(`📊 Statystyki serwera`)
      .addFields(
        { name: 'Liczba osób:', value: `${message.guild.memberCount}`, inline: true },
        { name: 'Właściciel:', value: `<@${message.guild.ownerId}>`, inline: true }
      );
    return message.reply({ embeds: [infoEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
