// Description:
//   Control the LED strip below our office couch
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot couch on - Turn on the LED strip
//   hubot couch off - Turn off the LED strip
//   hubot couch red|green|yellow|blue|magenta|cyan - Change the color of the LED strip

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');

function sendCommand(command, color = null) {
  payload = {
    command
  };
  if (color !== null) {
    payload['color'] = color;
  }

  return openFaas('office-couch-api', {
    method: 'POST',
    body: JSON.stringify(payload)
  }).then(response => {
    return;
  });
}

module.exports = robot => {
  robot.respond(/couch off/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_off').catch(error => send(error.message));
  });
  robot.respond(/couch on/i, msg => {
    const send = msg.send.bind(msg);
    sendCommand('power_on').catch(error => send(error.message));
  });

  robot.respond(/couch (red|green|yellow|blue|magenta|cyan)/i, msg => {
    const send = msg.send.bind(msg);
    const color = msg.match[1].trim();
    sendCommand('set_color', color).catch(error => send(error.message));
  });
};
