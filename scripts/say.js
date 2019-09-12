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

  return mqttClient.publish('office_say/command', JSON.stringify(payload));
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
TODO
    `;
    msg.send(voices);
  });
};
