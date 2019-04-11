// Description:
//   Control the TV over IR at the office
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot tv mute - Mute the TV
//   hubot tv på|av - Turn on/off the TV
//   hubot tv lyd opp <level_count> - Amount of volume levels to turn the TV up
//   hubot tv lyd ned <level_count> - Amount of volume levels to turn the TV down

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');

function sendCommand(command) {
  return openFaas('faas-to-mqtt-relay', {
    method: 'POST',
    body: JSON.stringify({
      topic: 'tv_remote/input',
      message: command
    })
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/tv (av|på)/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('POWER').catch(error => send(error.message));
  });
  robot.respond(/tv mute/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('MUTE').catch(error => send(error.message));
  });

  robot.respond(/tv lyd ned (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    const count = parseInt(msg.match[1].trim());
    sendCommand(`VOLUME_DOWN:${count}`).catch(error => send(error.message));
  });

  robot.respond(/tv lyd opp (.*)?/i, msg => {
    const send = msg.send.bind(msg);
    const count = parseInt(msg.match[1].trim());
    sendCommand(`VOLUME_UP:${count}`).catch(error => send(error.message));
  });
};
