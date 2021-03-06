// Description:
//   Control the LED strip below our office couch
// Configuration:
//   OPENFAAS_URL,
// Commands
//   hubot couch on - Turn on the LED strip
//   hubot couch off - Turn off the LED strip
//   hubot couch lock - Lock the power state of the LED strip so it cannot be changed by member presence
//   hubot couch unlock - Unlock the power state of the LED strip so it can be changed by member presence
//   hubot couch red|green|yellow|orange|blue|magenta|cyan - Change the color of the LED strip

const _ = require('lodash');
const fetch = require('node-fetch');
const openFaas = require('../lib/openfaas');
const logger = require('../lib/log');

function sendCommand(command, color = null) {
  payload = {
    command,
  };
  if (color !== null) {
    payload['color'] = color;
  }

  return openFaas('office-couch-api', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((response) => {
    return;
  });
}

module.exports = (robot) => {
  robot.respond(/couch off/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('force_power_off').catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('mobile_phone_off', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/couch on/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('force_power_on').catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('bulb', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/couch lock/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('power_lock').catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('lock', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/couch unlock/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    sendCommand('power_unlock').catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('unlock', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });

  robot.respond(/couch (red|green|yellow|orange|blue|magenta|cyan)/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const color = msg.match[1].trim();
    sendCommand('set_color', color).catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('sparkles', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
};
