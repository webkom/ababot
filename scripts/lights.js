// Description:
//   Control the ceiling lights at our office
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot lights on - Turn on the ceiling lights
//   hubot lights off - Turn off the ceiling lights
//   hubot lights lock - Lock the power state of the lights so it cannot be changed by other applications
//   hubot lights unlock - Unlock the power state of the lights so it can be changed by other applications

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
    sendCommand('force_power_off').catch(error => send(error.message));
  });
  robot.respond(/lights on/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('force_power_on').catch(error => send(error.message));
  });
  robot.respond(/lights lock/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_lock').catch(error => send(error.message));
  });
  robot.respond(/lights unlock/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_unlock').catch(error => send(error.message));
  });
};
