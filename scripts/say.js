// Description:
//   Voice synthesize anything!
//
// Commands
//   hubot say <text> - Synthesize <text> on the office speakers!
//   hubot say <text> <voice_name> - Synthesize <text> with chosen voice synthesizer
//   hubot voices - Display a list of available voices

const _ = require('lodash');
const fetch = require('node-fetch');
const mqttClient = require('../lib/mqtt_client');

const voices = {
  af: 'Afrikaans',
  ar: 'Arabic',
  bn: 'Bengali',
  bs: 'Bosnian',
  ca: 'Catalan',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  'en-au': 'English (Australia)',
  'en-ca': 'English (Canada)',
  'en-gb': 'English (UK)',
  'en-gh': 'English (Ghana)',
  'en-ie': 'English (Ireland)',
  'en-in': 'English (India)',
  'en-ng': 'English (Nigeria)',
  'en-nz': 'English (New Zealand)',
  'en-ph': 'English (Philippines)',
  'en-tz': 'English (Tanzania)',
  'en-uk': 'English (UK)',
  'en-us': 'English (US)',
  'en-za': 'English (South Africa)',
  eo: 'Esperanto',
  es: 'Spanish',
  'es-es': 'Spanish (Spain)',
  'es-us': 'Spanish (United States)',
  et: 'Estonian',
  fi: 'Finnish',
  fr: 'French',
  'fr-ca': 'French (Canada)',
  'fr-fr': 'French (France)',
  gu: 'Gujarati',
  hi: 'Hindi',
  hr: 'Croatian',
  hu: 'Hungarian',
  hy: 'Armenian',
  id: 'Indonesian',
  is: 'Icelandic',
  it: 'Italian',
  ja: 'Japanese',
  jw: 'Javanese',
  km: 'Khmer',
  kn: 'Kannada',
  ko: 'Korean',
  la: 'Latin',
  lv: 'Latvian',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mr: 'Marathi',
  my: 'Myanmar (Burmese)',
  ne: 'Nepali',
  nl: 'Dutch',
  no: 'Norwegian',
  pl: 'Polish',
  pt: 'Portuguese',
  'pt-br': 'Portuguese (Brazil)',
  'pt-pt': 'Portuguese (Portugal)',
  ro: 'Romanian',
  ru: 'Russian',
  si: 'Sinhala',
  sk: 'Slovak',
  sq: 'Albanian',
  sr: 'Serbian',
  su: 'Sundanese',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tl: 'Filipino',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  vi: 'Vietnamese',
  'zh-cn': 'Chinese (Mandarin/China)',
  'zh-tw': 'Chinese (Mandarin/Taiwan)'
};

const isVoiceName = voiceName =>
  Object.keys(voices).find(voice => voice == voiceName) !== undefined;

function sendCommand(command, text = null, voiceName = null) {
  let payload = {
    command
  };
  if (voiceName !== null) {
    payload['voice_name'] = voiceName;
  }
  if (text !== null) {
    payload['text'] = text;
  }

  const client = mqttClient();
  client.publish('office_say/command', JSON.stringify(payload));
}

module.exports = robot => {
  robot.respond(/say (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    let text = msg.match[1] && msg.match[1].trim();

    let voiceName = text
      .split(' ')
      .splice(-1)[0]
      .toLowerCase();

    if (voiceName !== 'random' && !isVoiceName(voiceName)) {
      voiceName = null;
    } else {
      var lastIndex = text.lastIndexOf(' ');
      text = text.substring(0, lastIndex);
    }

    sendCommand('say', text, voiceName);
  });

  robot.respond(/voices/i, msg => {
    let formattedVoices = '';
    for (key in voices) {
      formattedVoices += `\`${key}\`: ${voices[key]}\n`;
    }
    msg.send(formattedVoices);
  });
};
