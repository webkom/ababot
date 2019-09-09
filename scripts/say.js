// Description:
//   Voice synthesize anything!
//
// Commands
//   hubot say <text> - Synthesize <text> on the office speakers!
//   hubot say <text> <voice_nr> - Synthesize <text> with chosen voice synthesizer
//   hubot voices - Display a list of available voices

const _ = require('lodash');
const fetch = require('node-fetch');
const members = require('../lib/members');
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://mqtt.abakus.no', {
  username: 'odinugedal',
  password: ''
});

client.on('connect', function() {
  client.subscribe('office-say/command', function(err) {
    if (!err) {
      client.publish('office-say/command', 'Hello mqtt');
    }
  });
});

function sendCommand(command, text = null, voice_nr = null) {
  payload = {
    command
  };
  if (voice_nr !== null) {
    payload['voice_nr'] = voice_nr;
  }
  if (text !== null) {
    payload['text'] = text;
  }

  console.log('Sending payload: ' + JSON.stringify(payload));
  return client.publish('office-say/command', JSON.stringify(payload));
}

module.exports = robot => {
  robot.respond(/say (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    const text = msg.match[1].trim();
    const voice_nr = msg.match[2].trim();
    sendCommand('say', text, voice_nr).catch(error => send(error.message));
  });

  robot.respond(/voices/i, msg => {
    const voices = `voice nr 0: en_US (Alex)
    voice nr 1: it_IT (Alice)
    voice nr 2: sv_SE (Alva)
    voice nr 3: fr_CA (Amelie)
    voice nr 4: de_DE (Anna)
    voice nr 5: he_IL (Carmit)
    voice nr 6: id_ID (Damayanti)
    voice nr 7: en_GB (Daniel)
    voice nr 8: es_AR (Diego)
    voice nr 9: nl_BE (Ellen)
    voice nr 10: en-scotland (Fiona)
    voice nr 11: en_US (Fred)
    voice nr 12: ro_RO (Ioana)
    voice nr 13: pt_PT (Joana)
    voice nr 14: es_ES (Jorge)
    voice nr 15: es_MX (Juan)
    voice nr 16: th_TH (Kanya)
    voice nr 17: en_AU (Karen)
    voice nr 18: ja_JP (Kyoko)
    voice nr 19: sk_SK (Laura)
    voice nr 20: hi_IN (Lekha)
    voice nr 21: it_IT (Luca)
    voice nr 22: pt_BR (Luciana)
    voice nr 23: ar_SA (Maged)
    voice nr 24: hu_HU (Mariska)
    voice nr 25: zh_TW (Mei-Jia)
    voice nr 26: el_GR (Melina)
    voice nr 27: ru_RU (Milena)
    voice nr 28: en_IE (Moira)
    voice nr 29: es_ES (Monica)
    voice nr 30: nb_NO (Nora)
    voice nr 31: es_MX (Paulina)
    voice nr 32: en_US (Samantha)
    voice nr 33: da_DK (Sara)
    voice nr 34: fi_FI (Satu)
    voice nr 35: zh_HK (Sin-ji)
    voice nr 36: en_ZA (Tessa)
    voice nr 37: fr_FR (Thomas)
    voice nr 38: zh_CN (Ting-Ting)
    voice nr 39: en_IN (Veena)
    voice nr 40: en_US (Victoria)
    voice nr 41: nl_NL (Xander)
    voice nr 42: tr_TR (Yelda)
    voice nr 43: ko_KR (Yuna)
    voice nr 44: ru_RU (Yuri)
    voice nr 45: pl_PL (Zosia)
    voice nr 46: cs_CZ (Zuzana)
    `;
    msg.send(voices);
  });
};
