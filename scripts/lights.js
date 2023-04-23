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
const logger = require('../lib/log');

function sendCommand(command, light = '') {
  payload = {
    command,
    light,
  };

  return openFaas('office-lights-api', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((response) => {
    return;
  });
}

module.exports = (robot) => {
  robot.respond(/lights off( .+)?/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const light = msg.match[1] ? msg.match[1].trim() : '';
    sendCommand('force_power_off', light).catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('mobile_phone_off', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/lights on( .+)?/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const light = msg.match[1] ? msg.match[1].trim() : '';
    sendCommand('force_power_on', light).catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('bulb', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/lights lock( .+)?/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const light = msg.match[1] ? msg.match[1].trim() : '';
    sendCommand('power_lock', light).catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('lock', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
  robot.respond(/lights unlock( .+)?/i, (msg) => {
    logger.log(msg);
    const send = msg.send.bind(msg);
    const light = msg.match[1] ? msg.match[1].trim() : '';
    sendCommand('power_unlock', light).catch((error) => send(error.message));
    robot.adapter.client.web.reactions.add('unlock', {
      channel: msg.message.room,
      timestamp: msg.message.id,
    });
  });
};
