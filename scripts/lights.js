// Description:
//   Control the ceiling lights at our office
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot lights on - Turn on the ceiling lights
//   hubot lights off - Turn off the ceiling lights

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');

function sendCommand(command) {
  payload = {
    command
  };

  return openFaas('office-lights-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/lights off/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_off').catch(error => send(error.message));
  });
  robot.respond(/lights on/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_on').catch(error => send(error.message));
  });
};
