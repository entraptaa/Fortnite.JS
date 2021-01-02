const { readFile, writeFile } = require('fs').promises;
const { get } = require('request-promise');
const { Client } = require('fnbr');
const config = require('./config.json')

const fetchCosmetic = async (name, type) => {
  try {
    const cosmetic = (await get({ url: `https://fortnite-api.com/v2/cosmetics/br/search?name=${encodeURI(name)}&type=${type}`, json: true })).data;
    return cosmetic;
  } catch (err) {
    return undefined;
  }
};

const handleCommand = async (m) => {
  if (!m.content.startsWith('!')) return;
  const args = m.content.slice(1).split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'outfit' || command === 'skin') {
    const skin = await fetchCosmetic(args.join(' '), 'outfit');
    if (skin) {
      m.Client.party.me.setOutfit(skin.id);
      m.reply(`Set the skin to ${skin.name}!`);
    } else m.reply(`The skin ${args.join(' ')} wasn't found!`);
  } else if (command === 'emote' || command === 'dance') {
    const emote = await fetchCosmetic(args.join(' '), 'emote');
    if (emote) {
      m.Client.party.me.setEmote(emote.id);
      m.reply(`Set the emote to ${emote.name}!`);
    } else m.reply(`The emote ${args.join(' ')} wasn't found!`);
  }

  if (command === 'help' || command === 'commands') {
    m.reply('Current commands: !skin, !emote, !sitout, !jumpin, !gift, !stop, !default, !henchman, !marauder, !hologram, !shutdown')
  }

  if (command == 'sitout') {
    m.Client.party.me.setSittingOut(true)
    m.reply('Done!')
  }

  if (command == 'jumpin') {
    m.Client.party.me.setSittingOut(false)
    m.reply('Done!')
  }

  if (command == 'gift') {
    const item = args.slice(0).join(' ');
    if (!item) return m.reply("No item was provided.");

    await m.Client.party.me.clearEmote();
    await m.Client.party.me.setEmote('EID_NeverGonna');

    m.reply("Uhh, did you really think I was gonna gift you something?!")
  }

  if (command == 'stop') {
    await m.Client.party.me.clearEmote();
    m.reply("Stopped emoting.")
  }

  if (command == 'default') {
    const cids = ['CID_001_Athena_Commando_F_Default', 'CID_002_Athena_Commando_F_Default', 'CID_003_Athena_Commando_F_Default', 'CID_004_Athena_Commando_F_Default', 'CID_005_Athena_Commando_M_Default', 'CID_006_Athena_Commando_M_Default', 'CID_007_Athena_Commando_M_Default', 'CID_008_Athena_Commando_M_Default'];
    const cid = cids[Math.floor(Math.random() * cids.length)];

    m.Client.party.me.setOutfit(cid);
    m.reply('A random default has been equipped.');
  }

  if (command == 'marauder') {
    const marauders = ['CID_NPC_Athena_Commando_M_MarauderHeavy', 'CID_NPC_Athena_Commando_M_MarauderElite', 'CID_NPC_Athena_Commando_M_MarauderGrunt'];
    const marauder = marauders[Math.floor(Math.random() * marauders.length)];

    m.Client.party.me.setOutfit(marauder);
    m.reply('A random marauder has been equipped.');
  }

  if (command == 'henchman') {
    const henchmans = ['CID_794_Athena_Commando_M_HenchmanBadShorts_D', 'CID_NPC_Athena_Commando_F_HenchmanSpyDark', 'CID_791_Athena_Commando_M_HenchmanGoodShorts_D', 'CID_780_Athena_Commando_M_HenchmanBadShorts', 'CID_NPC_Athena_Commando_M_HenchmanGood', 'CID_692_Athena_Commando_M_HenchmanTough', 'CID_707_Athena_Commando_M_HenchmanGood', 'CID_792_Athena_Commando_M_HenchmanBadShorts_B', 'CID_793_Athena_Commando_M_HenchmanBadShorts_C', 'CID_NPC_Athena_Commando_M_HenchmanBad', 'CID_790_Athena_Commando_M_HenchmanGoodShorts_C', 'CID_779_Athena_Commando_M_HenchmanGoodShorts', 'CID_NPC_Athena_Commando_F_RebirthDefault_Henchman', 'CID_NPC_Athena_Commando_F_HenchmanSpyGood', 'CID_706_Athena_Commando_M_HenchmanBad', 'CID_789_Athena_Commando_M_HenchmanGoodShorts_B'];
    const henchman = henchmans[Math.floor(Math.random() * henchmans.length)];

    m.Client.party.me.setOutfit(henchman);
    m.reply('A random henchman has been equipped.');
  }

  if (command == 'hologram') {
    m.Client.party.me.setOutfit('CID_VIP_Athena_Commando_M_GalileoGondola_SG');

    m.reply('Equipped the Hologram skin from the Star Wars event!');
  }

  if (command == 'shutdown') {
    try {
      await m.Client.logout();
    } catch {
      return m.reply('An error has occured trying to log off the Fortnite client, operation canceled.');
    }

    console.log('Fortnite client has been shut down.');
    console.log('[FORTNITE.JS] [INFO]', 'Thank you for using Fornite.JS!');
    process.exit();
  }
};

(async () => {
  let auth;
  try {
    auth = { deviceAuth: JSON.parse(await readFile('./deviceAuth.json')) };
  } catch (e) {
    auth = { authorizationCode: async () => Client.consoleQuestion('Please enter an authorization code: ') };
  }

  const Options = {
    status: config.status,
    platform: config.platform,
    keepAliveInterval: 30,
    debug: false,
    kairos: {
      cid: config.cid[0] ? config.cid[0] : config.cid,
    }
  }

  const client = new Client({ auth });

  client.on('deviceauth:created', (da) => writeFile('./deviceAuth.json', JSON.stringify(da, null, 2)));
  client.on('party:member:message', handleCommand);
  client.on('friend:message', handleCommand);

  await client.login();
  console.log(`Logged in as ${client.user.displayName}`);
})();