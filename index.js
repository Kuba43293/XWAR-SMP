require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, EmbedBuilder } = require('discord.js');

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
  console.log(`Bot ${client.user.tag} jest online i gotowy!`);
  updateStatus();
  // Odświeżanie statusu co 5 minut
  setInterval(updateStatus, 300000); 
});

// SYSTEM POWITAŃ - bot wyśle wiadomość na kanał o nazwie "witamy"
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
  updateStatus(); // Natychmiastowa aktualizacja licznika społeczności
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // --- ELEGANCKA KOMENDA !POMOC (Wersja z obrazka) ---
  if (msg === '!pomoc') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('✨ CENTRUM POMOCY XWAR SMP ✨')
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription('Witaj! Oto lista wszystkich funkcji, które pomogą Ci na serwerze:')
      .addFields(
        { 
            name: '📍 Główne informacje', 
            value: '> **!ip** - Dane serwera\n> **!dc** - Link Discord\n> **!regulamin** - Zasady' 
        },
        { 
            name: '🎮 Gry i Zabawa', 
            value: '> **!kostka** - Rzut kostką\n> **!moneta** - Orzeł/Reszka\n> **!ping** - Status bota' 
        },
        { 
            name: '👑 Administracja', 
            value: '> **!autor** - Twórca bota\n> **!ogloszenie [tekst]** - Robi ogłoszenie' 
        }
      )
      .setFooter({ 
          text: 'XWAR SMP - Twoja kraina survivalu!', 
          iconURL: client.user.displayAvatarURL() 
      })
      .setTimestamp();

    return message.reply({ embeds: [helpEmbed] });
  }

  // --- KOMENDA !IP (Wersja 1.21.11) ---
  if (msg === '!ip' || msg === '!serwer') {
    const ipEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 SERWER XWAR SMP')
      .addFields(
        { name: '🌍 ADRES IP', value: '`Xwarsmp.aternos.me`', inline: true },
        { name: '🔌 PORT', value: '`34899`', inline: true },
        { name: '🛠️ WERSJA', value: '`1.21.11`', inline: false }
      )
      .setFooter({ text: 'Zasuwaj budować bazę! 🔥' });

    return message.reply({ embeds: [ipEmbed] });
  }

  // --- KOMENDA !DC ---
  if (msg === '!dc') {
    return message.reply('🔗 **Oficjalne zaproszenie:** https://discord.gg/awEJcWmM');
  }

  // --- KOMENDA !AUTOR ---
  if (msg === '!autor') {
    return message.reply('👑 Twórcą bota jest **Sigiemka**.');
  }

  // --- KOMENDA !REGULAMIN ---
  if (msg === '!regulamin') {
    return message.reply('📜 **REGULAMIN:** Nie czituj, nie kradnij, szanuj innych i zakaz reklam!');
  }

  // --- KOMENDA !PING ---
  if (msg === '!ping') {
    return message.reply(`🏓 Pong! Opóźnienie: **${Math.round(client.ws.ping)}ms**`);
  }

  // --- KOMENDA !OGLOSZENIE ---
  if (msg.startsWith('!ogloszenie ')) {
    const text = message.content.slice(12);
    const ann = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📢 OGŁOSZENIE')
      .setDescription(text)
      .setTimestamp();
    
    await message.channel.send({ embeds: [ann] });
    return message.delete();
  }
});

client.login(process.env.DISCORD_TOKEN);
