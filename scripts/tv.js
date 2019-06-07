// Description:
//   Control the TV (via Chromecast)
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot tv on - Turn on the TV
//   hubot tv off - Turn off the TV
//   hubot tv pause - Pause whatever is playing on the TV
//   hubot tv play - Start playing (again)
//   hubot tv mute - Mute the TV
//   hubot tv unmute - Unmute the TV
//   hubot tv next - Play the next item (song/video) in the list
//   hubot tv previous - Play the previous item (song/video) in the list
//   hubot tv 0-100 - Change the volume of the TV (0% to 100%)

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');

function sendCommand(command, volume = null) {
  payload = {
    command
  };
  if (volume !== null) {
    payload['volume'] = volume;
  }

  return openFaas('office-chromecast-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/tv on/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_on').catch(error => send(error.message));
  });
  robot.respond(/tv off/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_off').catch(error => send(error.message));
  });
  robot.respond(/tv pause/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('pause').catch(error => send(error.message));
  });
  robot.respond(/tv play/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('play').catch(error => send(error.message));
  });
  robot.respond(/tv mute/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('mute').catch(error => send(error.message));
  });
  robot.respond(/tv unmute/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('unmute').catch(error => send(error.message));
  });
  robot.respond(/tv next/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('next').catch(error => send(error.message));
  });
  robot.respond(/tv previous/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('previous').catch(error => send(error.message));
  });

  // Alternative: /tv (?:100|[1-9]?[0-9])/i, but 251 -> 25
  robot.respond(/tv (\d{0,3})/i, msg => {
    const send = msg.send.bind(msg);
    let volume = msg.match[1].trim();
    let parsedVolume = parseInt(volume);
    if (isNaN(parsedVolume)) {
      return send(`'${volume}' er ikke et gyldig tall mellom 0 og 100`);
    }
    if (parsedVolume > 100) {
      parsedVolume = 100;
    } else if (parsedVolume < 0) {
      parsedVolume = 0;
    }
    sendCommand('set_volume', parsedVolume).catch(error => send(error.message));
  });
};
