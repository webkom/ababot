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

function sendCommand(command, text = null, voice_name = null) {
  let payload = {
    command
  };
  if (voice_name !== null) {
    payload['voice_name'] = voice_name;
  }
  if (text !== null) {
    payload['text'] = text;
  }

  return mqttClient().publish('office_say/command', JSON.stringify(payload));
}

module.exports = robot => {
  robot.respond(/say (.*)? (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    let text = msg.match[1] && msg.match[1].trim();
    let voice_name = msg.match[2] && msg.match[2].trim();

    // If the last argument wasn't a number, interpret that as voice_name not
    // being provided
    if (voice_name !== 'random' && isNaN(voice_name)) {
      text = text + ' ' + voice_name;
      voice_name = null;
    }
    sendCommand('say', text, voice_name);
  });

  robot.respond(/voices/i, msg => {
    const voices = `
af Afrikaans
ar Arabic
bn Bengali
bs Bosnian
ca Catalan
cs Czech
cy Welsh
da Danish
de German
el Greek
en English
en-au English (Australia)
en-ca English (Canada)
en-gb English (UK)
en-gh English (Ghana)
en-ie English (Ireland)
en-in English (India)
en-ng English (Nigeria)
en-nz English (New Zealand)
en-ph English (Philippines)
en-tz English (Tanzania)
en-uk English (UK)
en-us English (US)
en-za English (South Africa)
eo Esperanto
es Spanish
es-es Spanish (Spain)
es-us Spanish (United States)
et Estonian
fi Finnish
fr French
fr-ca French (Canada)
fr-fr French (France)
gu Gujarati
hi Hindi
hr Croatian
hu Hungarian
hy Armenian
id Indonesian
is Icelandic
it Italian
ja Japanese
jw Javanese
km Khmer
kn Kannada
ko Korean
la Latin
lv Latvian
mk Macedonian
ml Malayalam
mr Marathi
my Myanmar (Burmese)
ne Nepali
nl Dutch
no Norwegian
pl Polish
pt Portuguese
pt-br Portuguese (Brazil)
pt-pt Portuguese (Portugal)
ro Romanian
ru Russian
si Sinhala
sk Slovak
sq Albanian
sr Serbian
su Sundanese
sv Swedish
sw Swahili
ta Tamil
te Telugu
th Thai
tl Filipino
tr Turkish
uk Ukrainian
ur Urdu
vi Vietnamese
zh-cn Chinese (Mandarin/China)
zh-tw Chinese (Mandarin/Taiwan)
    `;
    msg.send(voices);
  });
};
